import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  async,
  ComponentFixture,
  inject,
  TestBed,
} from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AlertDialogComponent } from '@shared/components/alert-dialog/alert-dialog.component';
import { MESSAGE_TPYE } from '@shared/constants/common.constants';
import { RP_ALERTS } from '@shared/constants/program.constants';
import { EngageService } from '@shared/services/engage.service';
import { RouterService } from '@shared/services/router.service';
import { SpinnerService } from '@shared/services/spinner.service';
import { ToastMessageService } from '@shared/services/toast-message.service';
import { CreateProgramModalComponent } from '@programs/create-program-modal/create-program-modal.component';
import {
  booksDetailsMock,
  closedProgramDetailMock,
  programDetailMock,
  programNoBooksMock,
  programOwnerMock,
  upcomingProgramDetailMock,
} from '@programs/shared/data/programs.mock';

import { ProgramDetailComponent } from './program-detail.component';
import { APP_BASE_HREF } from '@angular/common';

describe('ProgramDetailComponent', () => {
  let component: ProgramDetailComponent;
  let fixture: ComponentFixture<ProgramDetailComponent>;
  let engageService: EngageService;
  let routerService: RouterService;
  let toastMessageService: ToastMessageService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        RouterModule.forRoot([]),
        MatSnackBarModule,
        MatDialogModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        SpinnerService,
        MatDialogModule,
        RouterService,
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
      declarations: [
        ProgramDetailComponent,
        AlertDialogComponent,
        CreateProgramModalComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramDetailComponent);
    component = fixture.componentInstance;
    engageService = TestBed.inject(EngageService);
    routerService = TestBed.inject(RouterService);
    toastMessageService = TestBed.inject(ToastMessageService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('getProgramDetails', () => {
    it('should call getProgramDetails and return response', () => {
      programDetailMock.programId = '4a5ab1f3-71cc-4ec1-84a1-4150da0ac24d';
      const response: any = programDetailMock;
      spyOn(engageService, 'getProgramById').and.returnValue(of(response));
      spyOn(component, 'getCreatorDetails');
      component.getProgramDetails();
      expect(component.getCreatorDetails).toHaveBeenCalledWith(
        '4EF751C1-D13D-43C6-AEE4-14F4568DC3BB'
      );
    });
    it('should call getProgramDetails and return response with error', inject(
      [Router],
      (router: Router) => {
        const spyRoute = spyOn(router, 'navigateByUrl').and.callThrough();
        programDetailMock.programId = undefined;
        const programRes: any = programDetailMock;
        spyOn(engageService, 'getProgramById').and.returnValue(of(programRes));
        component.getProgramDetails();
        expect(spyRoute).toHaveBeenCalledWith('/programs');
      }
    ));
    it('should call getProgramDetails error', () => {
      const errorResponse = new Error();
      spyOn(engageService, 'getProgramById').and.returnValue(
        throwError(errorResponse)
      );
      component.getProgramDetails();
      expect(component.notLoading).toEqual(true);
    });
  });
  describe('getCreatorDetails', () => {
    it('should call getCreatorDetails and return response', () => {
      const response: any = { ...programOwnerMock };
      spyOn(engageService, 'getCreatorDetails').and.returnValue(of(response));
      component.getCreatorDetails('4EF751C1-D13D-43C6-AEE4-14F4568DC3BB');
      expect(component.creatorName).toBe('Loi');
    });
    it('should call getCreatorDetails and return response with displayName as undefined', () => {
      const response: any = { ...programOwnerMock };
      response.displayName = undefined;
      spyOn(engageService, 'getCreatorDetails').and.returnValue(of(response));
      component.getCreatorDetails('4EF751C1-D13D-43C6-AEE4-14F4568DC3BB');
      expect(engageService.getCreatorDetails).toHaveBeenCalled();
    });
  });
  describe('updateBookDetails', () => {
    it('should call updateBookDetails', () => {
      component.programInfo = programDetailMock;
      const response: any = programDetailMock;
      spyOn(engageService, 'getProgramById').and.returnValue(of(response));
      const BookDataResponse = booksDetailsMock;
      const spygetBooksById = spyOn(
        engageService,
        'getBooksById'
      ).and.returnValue(of(BookDataResponse));
      component.getProgramDetails();
      component.updateBookDetails();
      expect(spygetBooksById).toHaveBeenCalledWith([
        '0012370938',
        '0012244561',
        '0012279260',
        '0012282855',
      ]);
    });
  });
  describe('getStatus', () => {
    it('should call getStatus with closed/completed program', () => {
      programDetailMock.programId = '9d4b3ce2-c9c3-4aed-a4c6-864cf84b1926';
      const response: any = closedProgramDetailMock;
      spyOn(engageService, 'getProgramById').and.returnValue(of(response));
      component.getProgramDetails();
      component.getStatus();
      expect(engageService.getProgramById).toHaveBeenCalled();
    });
    it('should call getStatus with upcoming program', () => {
      programDetailMock.programId = '4a5ab1f3-71cc-4ec1-84a1-4150da0ac24d';
      const response: any = upcomingProgramDetailMock;
      spyOn(engageService, 'getProgramById').and.returnValue(of(response));
      component.getProgramDetails();
      component.getStatus();
      expect(engageService.getProgramById).toHaveBeenCalled();
    });
  });
  describe('getTypeInfo', () => {
    it('should call getTypeInfo with no books', () => {
      programDetailMock.programId = '4a5ab1f3-71cc-4ec1-84a1-4150da0ac24d';
      const response: any = programNoBooksMock;
      spyOn(engageService, 'getProgramById').and.returnValue(of(response));
      component.getProgramDetails();
      component.getTypeInfo(component.programInfo);
      expect(engageService.getProgramById).toHaveBeenCalled();
    });
  });
  describe('getDate', () => {
    it('should call getDate with date', () => {
      const res = component.getDate('2021-11-09T09:40:33.0Z');
      expect(res).toBe('11/09/2021');
    });
    it('should call getDate without date', () => {
      const res = component.getDate();
      expect(res).toEqual('');
    });
  });
  describe('programAction', () => {
    it('should call programAction with unpublish program', () => {
      programDetailMock.programId = '4a5ab1f3-71cc-4ec1-84a1-4150da0ac24d';
      const response: any = programDetailMock;
      spyOn(engageService, 'getProgramById').and.returnValue(of(response));
      const unpublishResponse: any = {
        responseCode: 200,
        message: 'Successfully unpublished the program',
      };
      spyOn(engageService, 'unpublishProgram').and.returnValue(
        of(unpublishResponse)
      );
      component.activeTab = 'MY PROGRAMS';
      component.getProgramDetails();
      component.programAction('UNPUBLISH');
      fixture.detectChanges();
      expect(engageService.unpublishProgram).toHaveBeenCalled();
    });
    it('should call programAction with unpublish program with msg as empty', () => {
      programDetailMock.programId = '4a5ab1f3-71cc-4ec1-84a1-4150da0ac24d';
      const response: any = programDetailMock;
      spyOn(engageService, 'getProgramById').and.returnValue(of(response));
      const unpublishResponse: any = {
        responseCode: 200,
        message: '',
      };
      spyOn(engageService, 'unpublishProgram').and.returnValue(
        of(unpublishResponse)
      );
      component.activeTab = undefined;
      component.getProgramDetails();
      component.programAction('UNPUBLISH');
      fixture.detectChanges();
      expect(engageService.unpublishProgram).toHaveBeenCalled();
    });
    it('should call programAction with unpublish program and response code not 200', () => {
      programDetailMock.programId = '4a5ab1f3-71cc-4ec1-84a1-4150da0ac24d';
      const response: any = programDetailMock;
      spyOn(engageService, 'getProgramById').and.returnValue(of(response));
      const unpublishResponse: any = {
        responseCode: 400,
        message: 'Not Found',
      };
      spyOn(engageService, 'unpublishProgram').and.returnValue(
        of(unpublishResponse)
      );
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      component.getProgramDetails();
      component.programAction('UNPUBLISH');
      expect(engageService.unpublishProgram).toHaveBeenCalled();
      const msg =
        'Something went wrong with your submission. Please try again.';
      expect(toastMessageService.showSnackBar).toHaveBeenCalledWith(
        MESSAGE_TPYE.ERROR,
        msg
      );
    });
    it('should call programAction with unpublish program error', () => {
      programDetailMock.programId = '4a5ab1f3-71cc-4ec1-84a1-4150da0ac24d';
      const response: any = programDetailMock;
      spyOn(engageService, 'getProgramById').and.returnValue(of(response));
      const errorResponse = new Error();
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      spyOn(engageService, 'unpublishProgram').and.returnValue(
        throwError(errorResponse)
      );
      component.getProgramDetails();
      component.programAction('UNPUBLISH');
      const msg =
        'Something went wrong with your submission. Please try again.';
      expect(toastMessageService.showSnackBar).toHaveBeenCalledWith(
        MESSAGE_TPYE.ERROR,
        msg
      );
    });
    it('should call programAction with publish program', () => {
      programDetailMock.programId = '4a5ab1f3-71cc-4ec1-84a1-4150da0ac24d';
      const response: any = programDetailMock;
      spyOn(engageService, 'getProgramById').and.returnValue(of(response));
      const publishResponse: any = {
        programId: '716aeac3-f11d-4136-8fe4-995e166b0bd6',
        programName:
          'sfkfkdfdfdfdfdfdffdfdfdkjskjkds sdiofjsdiofjdsiofuios sdpo fuiou',
        description:
          'description here description here description here description here description here description here description here description here ',
        readByDate: '2021-11-30T18:29:59.0Z',
        startDate: '2021-11-09T09:40:17.0Z',
        programOwnerId: '4EF751C1-D13D-43C6-AEE4-14F4568DC3BB',
        status: 'Active',
        editable: true,
        reminderFrequency: 'none',
        isPublic: true,
        programType: 'OrderOfBooks',
        numberOfBooks: 1,
        createdDate: '2021-11-09T09:40:33.0Z',
        books: [
          {
            sequence: 1,
            bookId: '0012441763',
          },
          {
            sequence: 2,
            bookId: '0012486985',
          },
          {
            sequence: 3,
            bookId: '0012441487',
          },
        ],
        participants: [
          {
            mandatory: false,
            userGuid: '2a207478-8cea-4533-9557-f0c2b6dded8a',
            status: 'Accept',
          },
        ],
        isOwner: true,
        isParticipant: false,
        totalParticipants: 1,
        timeZone: 'IST',
        responseCode: 200,
      };
      spyOn(engageService, 'updateReadingProgram').and.returnValue(
        of(publishResponse)
      );
      component.getProgramDetails();
      component.programAction('Publish');
      expect(engageService.updateReadingProgram).toHaveBeenCalled();
    });
  });
  describe('openAlertDialog', () => {
    it('should call openAlertDialog', () => {
      programDetailMock.programId = '4a5ab1f3-71cc-4ec1-84a1-4150da0ac24d';
      const response: any = programDetailMock;
      spyOn(engageService, 'getProgramById').and.returnValue(of(response));
      const spyOpenAlert = spyOn(component, 'openAlert').and.callThrough();
      component.getProgramDetails();
      component.openAlertDialog(RP_ALERTS.UNPUBLISH, 'Test Program');
      fixture.detectChanges();
      expect(spyOpenAlert).toHaveBeenCalled();
    });
    it('should call openAlertDialog with programName undefined', () => {
      programDetailMock.programId = '4a5ab1f3-71cc-4ec1-84a1-4150da0ac24d';
      const response: any = programDetailMock;
      spyOn(engageService, 'getProgramById').and.returnValue(of(response));
      const spyOpenAlert = spyOn(component, 'openAlert').and.callThrough();
      component.getProgramDetails();
      component.openAlertDialog(RP_ALERTS.UNPUBLISH, undefined);
      expect(spyOpenAlert).toHaveBeenCalled();
    });
  });
  describe('openProgramModal', () => {
    it('should call openProgramModal without duplicate(false)', () => {
      programDetailMock.programId = '4a5ab1f3-71cc-4ec1-84a1-4150da0ac24d';
      const response: any = programDetailMock;
      spyOn(engageService, 'getProgramById').and.returnValue(of(response));
      component.activeTab = undefined;
      component.getProgramDetails();
      fixture.detectChanges();
      component.openProgramModal(false);
      expect(engageService.getProgramById).toHaveBeenCalled();
    });
    it('should call openProgramModal with duplicate(true)', () => {
      programDetailMock.programId = '4a5ab1f3-71cc-4ec1-84a1-4150da0ac24d';
      const response: any = programDetailMock;
      spyOn(engageService, 'getProgramById').and.returnValue(of(response));
      component.activeTab = 'MY PROGRAMS';
      component.getProgramDetails();
      component.openProgramModal(true);
      expect(engageService.getProgramById).toHaveBeenCalled();
    });
  });
  describe('goToProgram', () => {
    it('should call goToProgram with previousUrl draft program', inject(
      [Router],
      (router: Router) => {
        const spyRoute = spyOn(router, 'navigateByUrl').and.callThrough();
        routerService.previousUrl = '/draft';
        component.goToProgram();
        expect(spyRoute).toHaveBeenCalledWith('/programs/draft');
      }
    ));
    it('should call goToProgram with previousUrl active program', inject(
      [Router],
      (router: Router) => {
        const spyRoute = spyOn(router, 'navigateByUrl').and.callThrough();
        routerService.previousUrl = '/active';
        component.goToProgram();
        expect(spyRoute).toHaveBeenCalledWith('/programs/active');
      }
    ));
    it('should call goToProgram with previousUrl closed program', inject(
      [Router],
      (router: Router) => {
        const spyRoute = spyOn(router, 'navigateByUrl').and.callThrough();
        routerService.previousUrl = '/closed';
        component.goToProgram();
        expect(spyRoute).toHaveBeenCalledWith('/programs/closed');
      }
    ));
    it('should call goToProgram with previousUrl programs program', inject(
      [Router],
      (router: Router) => {
        const spyRoute = spyOn(router, 'navigateByUrl').and.callThrough();
        routerService.previousUrl = '/programs';
        component.goToProgram();
        expect(spyRoute).toHaveBeenCalledWith('/programs');
      }
    ));
  });
  describe('redirectToHome', () => {
    it('should call redirectToHome', inject([Router], (router: Router) => {
      const spyRoute = spyOn(router, 'navigateByUrl').and.callThrough();
      component.redirectToHome();
      expect(spyRoute).toHaveBeenCalledWith('/Admin');
    }));
  });
});

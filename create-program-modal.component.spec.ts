import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { noop } from '@shared/classes/util';
import { MESSAGE_TPYE } from '@shared/constants/common.constants';
import {
  PROGRAM_STATUS,
  RP_ALERTS,
  SUCCESS_MESSAGE,
} from '@shared/constants/program.constants';
import { EngageService } from '@shared/services/engage.service';
import { SpinnerService } from '@shared/services/spinner.service';
import { ToastMessageService } from '@shared/services/toast-message.service';
import {
  createProgramMock,
  createProgramWithDataMock,
  editProgramMock,
} from '@programs/shared/data/programs.mock';
import { CreateProgramModalComponent } from './create-program-modal.component';

describe('CreateProgramModalComponent', () => {
  let component: CreateProgramModalComponent;
  let fixture: ComponentFixture<CreateProgramModalComponent>;
  let engageService: EngageService;
  let toastMessageService: ToastMessageService;
  let spinnerService: SpinnerService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSnackBarModule,
        RouterTestingModule,
        MatSelectModule,
        MatInputModule,
        NoopAnimationsModule,
        MatSidenavModule,
      ],
      providers: [
        SpinnerService,
        {
          provide: MatDialogRef,
          useValue: {
            backdropClick: () => of(),
            afterOpened: () => of(),
            afterClosed: () => of(),
            close: noop,
          },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { ...createProgramWithDataMock },
        },
      ],

      declarations: [CreateProgramModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProgramModalComponent);
    component = fixture.componentInstance;
    engageService = TestBed.inject(EngageService);
    toastMessageService = TestBed.inject(ToastMessageService);
    spinnerService = TestBed.inject(SpinnerService);
    engageService.title = [
      {
        index: 1,
        bookId: '0012244569',
        sequence: 1,
        isHiddenTitle: false,
        Title: 'Cats Cradle',
        ImageUrl:
          'http://contentcafecloud.baker-taylor.com/Jacket.svc/F96D7B80-0E02-4F68-BDFC-6D9C11FD60A6/9780307567277/Medium/Logo',
        Authors: ['Vonnegut, Kurt '],
      },
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnInit', () => {
    it('should call ngOnInit', () => {
      component.modaldata = { ...createProgramMock };
      component.ngOnInit();
      expect(component.programId).toBe('');
    });
  });
  describe('searchTitleShow', () => {
    it('should call searchTitleShow innerWidth less than 700', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(640);
      component.searchTitleShow();
      expect(component.searchResult).toBe(true);
    });
    it('should call searchTitleShow greater than 700', () => {
      spyOn(component.searchTitleScreen, 'open');
      spyOnProperty(window, 'innerWidth').and.returnValue(960);
      component.searchTitleShow();
      expect(component.searchTitleScreen.open).toHaveBeenCalled();
    });
  });
  describe('isInValid', () => {
    it('should call isInValid publish as false', () => {
      component.createProgramForm.controls.programName.setValue('');
      component.isSubmitted = true;
      component.publish = false;
      engageService.title = [
        {
          index: 1,
          bookId: '0012244569',
          sequence: 1,
          isHiddenTitle: false,
          Title: 'Cats Cradle',
          ImageUrl:
            'http://contentcafecloud.baker-taylor.com/Jacket.svc/F96D7B80-0E02-4F68-BDFC-6D9C11FD60A6/9780307567277/Medium/Logo',
          Authors: ['Vonnegut, Kurt '],
        },
      ];
      const result = component.isInValid();
      expect(result).toBe(true);
    });
    it('should call isInValid publish as true', () => {
      component.isSubmitted = true;
      component.publish = true;
      engageService.title = [
        {
          index: 1,
          bookId: '0012244569',
          sequence: 1,
          isHiddenTitle: false,
          Title: 'Cats Cradle',
          ImageUrl:
            'http://contentcafecloud.baker-taylor.com/Jacket.svc/F96D7B80-0E02-4F68-BDFC-6D9C11FD60A6/9780307567277/Medium/Logo',
          Authors: ['Vonnegut, Kurt '],
        },
      ];
      const result = component.isInValid();
      expect(result).toBe(false);
    });
  });
  describe('submitProgram', () => {
    it('should call submitProgram publish as false and programName empty  and with disableSaveAction return as true', () => {
      spyOn(component, 'disableSaveAction').and.callThrough();
      component.createProgramForm.controls.programName.setValue('');
      component.submitProgram(false);
      expect(component.disableSaveAction).toHaveBeenCalled();
    });
    it('should call submitProgram publish as true with disablePublishAction return as true', () => {
      spyOn(component, 'disablePublishAction').and.callThrough();
      component.createProgramForm.controls.programName.setValue('test');
      component.createProgramForm.controls.programType.setValue('XOfYOfBooks');
      component.createProgramForm.controls.numberOfBooks.setValue(2);
      component.submitProgram(true);
      expect(component.disablePublishAction).toHaveBeenCalledWith();
    });
    it('should call submitProgram publish as true and reminderFrequency as null', () => {
      component.createProgramForm.controls.programName.setValue('test');
      component.createProgramForm.controls.programType.setValue('XOfYOfBooks');
      component.createProgramForm.controls.numberOfBooks.setValue(2);
      component.createProgramForm.controls.reminderFrequency.setValue(null);
      component.submitProgram(true);
      expect(component.isSubmitted).toEqual(true);
    });
    it('should call submitProgram publish as true with disablePublishAction return as false', () => {
      spyOn(component, 'disablePublishAction').and.callThrough();
      component.createProgramForm.controls.programName.setValue('test');
      component.createProgramForm.controls.programType.setValue('XOfYOfBooks');
      component.createProgramForm.controls.numberOfBooks.setValue(1);
      component.submitProgram(true);
      expect(component.disablePublishAction).toHaveBeenCalledWith();
    });

    it('should call submitProgram publish as true and isDuplicate as true', () => {
      spyOn(engageService, 'createReadingProgram').and.callThrough();
      component.createProgramForm.controls.programName.setValue('test');
      component.createProgramForm.controls.programType.setValue('XOfYOfBooks');
      component.createProgramForm.controls.numberOfBooks.setValue(1);
      component.modaldata.isDuplicate = true;
      component.submitProgram(true);
      expect(component.modaldata.isDuplicate).toBe(true);
      expect(component.modaldata.programInfo.programId.length).toBeGreaterThan(
        1
      );
      expect(engageService.createReadingProgram).toHaveBeenCalled();
    });
    it('should call submitProgram publish as true and isDuplicate as false', () => {
      spyOn(engageService, 'updateReadingProgram').and.callThrough();
      component.createProgramForm.controls.programName.setValue('test');
      component.createProgramForm.controls.programType.setValue('XOfYOfBooks');
      component.createProgramForm.controls.numberOfBooks.setValue(1);
      component.modaldata.isDuplicate = false;
      component.submitProgram(true);
      expect(component.modaldata.isDuplicate).toBe(false);
      expect(component.modaldata.programInfo.programId.length).toBeGreaterThan(
        1
      );
      expect(engageService.updateReadingProgram).toHaveBeenCalled();
    });
    it('should call submitProgram publish as true and isDuplicate as false with spinnerService response 200', () => {
      spyOn(engageService, 'updateReadingProgram').and.callThrough();
      component.createProgramForm.controls.programName.setValue('test');
      component.createProgramForm.controls.programType.setValue('XOfYOfBooks');
      component.createProgramForm.controls.numberOfBooks.setValue(1);
      component.modaldata.isDuplicate = false;
      const response = {
        responseCode: 200,
        programId: '36b0559a-e896-46e6-9001-bab0347c74b5',
      };
      spyOn(spinnerService, 'withObservable').and.returnValue(of(response));
      component.submitProgram(true);
      expect(component.modaldata.isDuplicate).toBe(false);
      expect(component.modaldata.programInfo.programId.length).toBeGreaterThan(
        1
      );
      expect(engageService.updateReadingProgram).toHaveBeenCalled();
      expect(spinnerService.withObservable).toHaveBeenCalled();
    });
    it('should call submitProgram publish as true and isDuplicate as false with spinnerService response 404', () => {
      spyOn(engageService, 'updateReadingProgram').and.callThrough();
      component.createProgramForm.controls.programName.setValue('test');
      component.createProgramForm.controls.programType.setValue('XOfYOfBooks');
      component.createProgramForm.controls.numberOfBooks.setValue(1);
      component.modaldata.isDuplicate = false;
      const response = {
        responseCode: 404,
        programId: '36b0559a-e896-46e6-9001-bab0347c74b5',
      };
      spyOn(spinnerService, 'withObservable').and.returnValue(of(response));
      component.submitProgram(true);
      expect(component.modaldata.isDuplicate).toBe(false);
      expect(component.modaldata.programInfo.programId.length).toBeGreaterThan(
        1
      );
      expect(engageService.updateReadingProgram).toHaveBeenCalled();
      expect(spinnerService.withObservable).toHaveBeenCalled();
    });
    it('should call submitProgram publish as true and isDuplicate as false with error spinnerService response', () => {
      spyOn(engageService, 'updateReadingProgram').and.callThrough();
      component.createProgramForm.controls.programName.setValue('test');
      component.createProgramForm.controls.programType.setValue('XOfYOfBooks');
      component.createProgramForm.controls.numberOfBooks.setValue(1);
      component.modaldata.isDuplicate = false;
      const errorResponse = new Error();
      spyOn(spinnerService, 'withObservable').and.returnValue(
        throwError(errorResponse)
      );
      component.submitProgram(true);
      expect(component.modaldata.isDuplicate).toBe(false);
      expect(component.modaldata.programInfo.programId.length).toBeGreaterThan(
        1
      );
      expect(engageService.updateReadingProgram).toHaveBeenCalled();
      expect(spinnerService.withObservable).toHaveBeenCalled();
    });
  });
  describe('successRedirect', () => {
    let msg = '';
    it('should call successRedirect publish as true', () => {
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      component.successRedirect(true, '36b0559a-e896-46e6-9001-bab0347c74b5');
      msg = SUCCESS_MESSAGE.UPDATED;
      msg = msg.replace(
        '<programName>',
        component.modaldata.programInfo.programName
      );
      expect(toastMessageService.showSnackBar).toHaveBeenCalledWith(
        MESSAGE_TPYE.SUCCESS,
        msg
      );
    });
    it('should call successRedirect  publish as true and no program id', () => {
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      component.programId = '';
      component.successRedirect(true, '36b0559a-e896-46e6-9001-bab0347c74b5');
      msg = SUCCESS_MESSAGE.CREATED;
      msg = msg.replace(
        '<programName>',
        component.modaldata.programInfo.programName
      );
      expect(toastMessageService.showSnackBar).toHaveBeenCalledWith(
        MESSAGE_TPYE.SUCCESS,
        msg
      );
    });
    it('should call successRedirect  publish as true and isEdit as false', () => {
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      component.isEdit = false;
      component.successRedirect(true, '36b0559a-e896-46e6-9001-bab0347c74b5');
      msg = SUCCESS_MESSAGE.PUBLISHED;
      msg = msg.replace(
        '<programName>',
        component.modaldata.programInfo.programName
      );
      expect(toastMessageService.showSnackBar).toHaveBeenCalledWith(
        MESSAGE_TPYE.SUCCESS,
        msg
      );
    });
    it('should call successRedirect with publish as false', () => {
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      component.successRedirect(false, '36b0559a-e896-46e6-9001-bab0347c74b5');
      msg = SUCCESS_MESSAGE.SAVED;
      msg = msg.replace(
        '<programName>',
        component.modaldata.programInfo.programName
      );
      expect(toastMessageService.showSnackBar).toHaveBeenCalledWith(
        MESSAGE_TPYE.SUCCESS,
        msg
      );
    });
  });
  describe('closeDialog', () => {
    it('should call closeDialog', () => {
      spyOn(component.programDialog, 'close');
      component.closeDialog();
      expect(component.programDialog.close).toHaveBeenCalled();
    });
  });
  describe('cancelFn', () => {
    it('should call cancelFn', () => {
      const mock = document.getElementById('cprog-close-2');
      spyOn(mock, 'click');
      component.cancelFn();
      expect(mock.click).toHaveBeenCalled();
    });
    it('should call cancelFn btn undefined', () => {
      spyOn(document, 'getElementById').and.returnValue(undefined);
      const spy = component.cancelFn();
      expect(spy).toBe(undefined);
    });
  });
  describe('startDateChanges', () => {
    it('should call startDateChanges', () => {
      const mock = { ...createProgramWithDataMock };
      mock.programInfo.startDate = '2021-11-26T18:29:59.000Z';
      component.createProgramForm.patchValue({
        mock,
      });
      spyOn(component.maxReadByDate, 'setFullYear').and.callThrough();
      component.startDateChanges();
      expect(component.maxReadByDate.setFullYear).toHaveBeenCalled();
    });
  });
  describe('deleteProgram', () => {
    it('should call deleteProgram error', () => {
      const errorResponse = new Error();
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      spyOn(engageService, 'deleteProgram').and.returnValue(
        throwError(errorResponse)
      );
      component.deleteProgram();
      const msg =
        'Something went wrong with your submission. Please try again.';
      expect(toastMessageService.showSnackBar).toHaveBeenCalledWith(
        MESSAGE_TPYE.ERROR,
        msg
      );
    });
  });
  describe('closeSearchResult', () => {
    it('should call closeSearchResult', () => {
      spyOn(component.searchTitleScreen, 'close');
      component.closeSearchResult();
      expect(component.searchTitleScreen.close).toHaveBeenCalled();
    });
  });
  describe('titleReIndex', () => {
    it('should call titleReIndex', () => {
      spyOn(engageService, 'titleReIndex').and.callThrough();
      component.titleReIndex();
      expect(engageService.titleReIndex).toHaveBeenCalled();
    });
  });
  describe('deleteTitleAction', () => {
    it('should call deleteTitleAction', () => {
      spyOn(component, 'openAlertDialog');
      const engageTitleMock = {
        index: 1,
        bookId: '0012244569',
        sequence: 1,
        isHiddenTitle: false,
        Title: 'Cats Cradle',
        ImageUrl:
          'http://contentcafecloud.baker-taylor.com/Jacket.svc/F96D7B80-0E02-4F68-BDFC-6D9C11FD60A6/9780307567277/Medium/Logo',
        Authors: ['Vonnegut, Kurt '],
      };

      component.deleteTitleAction(engageTitleMock);
      expect(component.openAlertDialog).toHaveBeenCalledWith(
        RP_ALERTS.REMOVE_TITLE,
        engageTitleMock
      );
    });
  });
  describe('openSearchDialog', () => {
    it('should call openSearchDialog', () => {
      spyOn(component.matDialog, 'open').and.returnValue({
        afterClosed: () => of(true),
      } as MatDialogRef<typeof component>);
      component.openSearchDialog();
      expect(component.matDialog.open).toHaveBeenCalled();
    });
    it('should call openSearchDialog return undefined', () => {
      spyOn(component.matDialog, 'open').and.returnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<typeof component>);
      component.openSearchDialog();
      expect(component.matDialog.open).toHaveBeenCalled();
    });
  });
  describe('formatProgramForm', () => {
    it('should call formatProgramForm', () => {
      component.createProgramForm.controls.startDate.setValue(undefined);
      component.createProgramForm.controls.readByDate.setValue(undefined);
      fixture.detectChanges();
      component.formatProgramForm(true);
      expect(component.createProgramForm.get('startDate').value).toBe(
        undefined
      );
    });
    it('should call formatProgramForm with form data', () => {
      const modaldataMock = { ...editProgramMock };
      modaldataMock.programInfo.status = PROGRAM_STATUS.UNPUBLISHED;
      modaldataMock.isDuplicate = false;
      component.modaldata = modaldataMock;
      const mock = { ...createProgramWithDataMock };
      component.createProgramForm.patchValue({
        mock,
      });
      fixture.detectChanges();
      component.formatProgramForm(true);
      expect(component.createProgramForm.get('description').value).toBe(
        'descriptionview model containd duplicate test view'
      );
    });
  });
  describe('openAlertDialog', () => {
    it('should call openAlertDialog with close', () => {
      spyOn(component, 'handleCloseAlert').and.callThrough();
      const engageTitleMock = {
        index: 1,
        bookId: '0012244569',
        sequence: 1,
        isHiddenTitle: false,
        Title: 'Cats Cradle',
        ImageUrl:
          'http://contentcafecloud.baker-taylor.com/Jacket.svc/F96D7B80-0E02-4F68-BDFC-6D9C11FD60A6/9780307567277/Medium/Logo',
        Authors: ['Vonnegut, Kurt '],
      };
      component.openAlertDialog(RP_ALERTS.CLOSE, engageTitleMock);
      expect(component.handleCloseAlert).toHaveBeenCalled();
    });
    it('should call openAlertDialog with REMOVE_TITLE', () => {
      spyOn(component.matDialog, 'open').and.returnValue({
        afterClosed: () => of(true),
      } as MatDialogRef<typeof component>);
      const engageTitleMock = {
        index: 1,
        bookId: '0012244569',
        sequence: 1,
        isHiddenTitle: false,
        Title: 'Cats Cradle',
        ImageUrl:
          'http://contentcafecloud.baker-taylor.com/Jacket.svc/F96D7B80-0E02-4F68-BDFC-6D9C11FD60A6/9780307567277/Medium/Logo',
        Authors: ['Vonnegut, Kurt '],
      };
      component.openAlertDialog(RP_ALERTS.REMOVE_TITLE, engageTitleMock);
      expect(component.matDialog.open).toHaveBeenCalled();
    });
    it('should call openAlertDialog with DELETE', () => {
      spyOn(component, 'openAlert').and.callThrough();
      const engageTitleMock = {
        index: 1,
        bookId: '0012244569',
        sequence: 1,
        isHiddenTitle: false,
        Title: undefined,
        ImageUrl:
          'http://contentcafecloud.baker-taylor.com/Jacket.svc/F96D7B80-0E02-4F68-BDFC-6D9C11FD60A6/9780307567277/Medium/Logo',
        Authors: ['Vonnegut, Kurt '],
      };
      component.openAlertDialog(RP_ALERTS.DELETE, engageTitleMock);
      expect(component.openAlert).toHaveBeenCalled();
    });
  });
  describe('removeTitle', () => {
    it('should call removeTitle', () => {
      spyOn(engageService, 'removeTitle').and.callThrough();
      const engageTitleMock = {
        index: 1,
        bookId: '0012244569',
        sequence: 1,
        isHiddenTitle: false,
        Title: 'Cats Cradle',
        ImageUrl:
          'http://contentcafecloud.baker-taylor.com/Jacket.svc/F96D7B80-0E02-4F68-BDFC-6D9C11FD60A6/9780307567277/Medium/Logo',
        Authors: ['Vonnegut, Kurt '],
      };
      component.removeTitle(engageTitleMock);
      expect(engageService.removeTitle).toHaveBeenCalledWith(
        engageTitleMock.bookId
      );
    });
  });
  describe('describe onProgramTypeChange', () => {
    it('should call onProgramTypeChange', () => {
      component.onProgramTypeChange();
      expect(component.isProgramTypeError).toEqual(false);
    });
  });
});

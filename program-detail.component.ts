import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  displayErrorMessage,
  getDate,
  getLocalDate,
  noop,
  redirectUrl,
} from '@shared/classes/util';
import {
  AlertDialog,
  AlertDialogComponent,
} from '@shared/components/alert-dialog/alert-dialog.component';
import { MESSAGE_TPYE } from '@shared/constants/common.constants';
import {
  PROGRAM_STATUS,
  PROGRAM_TYPE,
  PROGRAM_TYPE_DISPLAY,
  RP_ALERTS,
  SUCCESS_MESSAGE,
} from '@shared/constants/program.constants';
import { Book, BookResponse, EngageTitle } from '@shared/model/book.model';
import { Program } from '@shared/model/program.model';
import { EngageService } from '@shared/services/engage.service';
import { RouterService } from '@shared/services/router.service';
import { SpinnerService } from '@shared/services/spinner.service';
import { ToastMessageService } from '@shared/services/toast-message.service';
import { CreateProgramModalComponent } from '@programs/create-program-modal/create-program-modal.component';

@Component({
  selector: 'axis360-program-detail',
  templateUrl: './program-detail.component.html',
  styleUrls: ['./program-detail.component.scss'],
})
export class ProgramDetailComponent implements OnInit {
  programId: string;
  notLoading = false;
  programInfo: Program;
  programResponseData: Program;
  rpStatus: string;
  RP_ALERTS = RP_ALERTS;
  creatorName: string;
  activeTab: string;
  homeUrl: string;
  constructor(
    private activatedRoute: ActivatedRoute,
    private spinnerService: SpinnerService,
    private engageService: EngageService,
    private toastMessageService: ToastMessageService,
    private router: Router,
    public matDialog: MatDialog,
    private routerService: RouterService
  ) {}

  ngOnInit(): void {
    this.programId = this.activatedRoute.snapshot.params.programId;
    this.activeTab = this.activatedRoute.snapshot.params.activeTab || '';
    this.homeUrl = '/Admin';
    this.initialize();
  }

  initialize() {
    this.notLoading = false;
    this.getProgramDetails();
  }

  getProgramDetails() {
    this.spinnerService
      .withObservable(this.engageService.getProgramById(this.programId || '0'))
      .subscribe(
        (programRes) => {
          this.notLoading = true;
          if (!programRes || !programRes.programId) {
            const msg = displayErrorMessage(programRes);
            this.toastMessageService.showSnackBar(
              MESSAGE_TPYE.ERROR,
              msg,
              false
            );
            this.router.navigateByUrl('/programs');
            return;
          }
          this.programInfo = programRes;
          this.programResponseData = { ...programRes };
          this.updateBookDetails();
          this.getCreatorDetails(this.programInfo.programOwnerId);
          this.getStatus();
        },
        () => {
          this.notLoading = true;
        }
      );
  }

  getCreatorDetails = (ownerId: string) => {
    this.spinnerService
      .withObservable(this.engageService.getCreatorDetails(ownerId))
      .subscribe((creatorRes: { displayName: string }) => {
        if (creatorRes.displayName) {
          this.creatorName = creatorRes.displayName;
        }
      }, noop);
  };

  updateBookDetails() {
    const booksArrList = this.programInfo.books?.map(
      (book: Book) => book.bookId
    );
    if (!booksArrList || booksArrList.length === 0) {
      return;
    }
    this.spinnerService
      .withObservable(this.engageService.getBooksById(booksArrList))
      .subscribe((bookRes: BookResponse) => {
        if (!bookRes || bookRes.Items?.length === 0) {
          this.notLoading = true;
          return;
        }
        this.programInfo.engageTitle = [];
        const hiddenTitle: EngageTitle = {
          isHiddenTitle: true,
          Title: '',
          ImageUrl: this.engageService.getDefaultBookImage(),
          bookId: '',
        };
        this.programInfo.books.forEach((book) => {
          const bookIndex = bookRes.Items?.findIndex(
            (bookInfo) => bookInfo.ItemId === book.bookId
          );
          if (bookIndex > -1) {
            const bookInfo = bookRes.Items[bookIndex];
            book.info = bookInfo;
            const bookDetail: EngageTitle = {
              Title: bookInfo.Title,
              ImageUrl: bookInfo.ImageUrl,
              Author: bookInfo.Author,
              sequence: book.sequence,
              bookId: book.bookId,
            };
            this.programInfo.engageTitle.push(bookDetail);
          } else {
            book.info = hiddenTitle;
            const bookDetail: EngageTitle = {
              ...hiddenTitle,
              bookId: book.bookId,
              sequence: book.sequence,
            };
            this.programInfo.engageTitle.push(bookDetail);
          }
        });
      }, noop);
  }

  getStatus() {
    if (this.programInfo.status === PROGRAM_STATUS.COMPLETE) {
      this.rpStatus = 'Closed';
    } else if (
      getLocalDate(this.programInfo.startDate) > getLocalDate(new Date()) ||
      this.programInfo.status === PROGRAM_STATUS.UNPUBLISHED
    ) {
      this.rpStatus = 'Not started';
    } else {
      this.rpStatus = 'Started';
    }
  }

  getTypeInfo({ programType, numberOfBooks, books = [] }: Program) {
    let programTypeText = PROGRAM_TYPE_DISPLAY[programType];
    if (programType === PROGRAM_TYPE.XOfYOfBooks) {
      programTypeText = programTypeText
        .replace('X', `${numberOfBooks}`)
        .replace('Y', `${books.length}`);
    }
    return programTypeText;
  }

  getDate(date?: string | Date) {
    return getDate(date);
  }

  programAction(type: string) {
    let apiCall: Observable<any>;
    if (type === RP_ALERTS.UNPUBLISH) {
      apiCall = this.engageService.unpublishProgram(this.programInfo.programId);
    } else {
      const programData: Program = { ...this.programResponseData };
      programData.publishProgram = true;
      delete programData.responseCode;
      delete programData.status;
      delete programData.editable;
      delete programData.isOwner;
      delete programData.createdDate;
      apiCall = this.engageService.updateReadingProgram(programData);
    }
    apiCall.subscribe(
      (data: any) => {
        if (data.responseCode !== 200) {
          const errorMsg = displayErrorMessage(data);
          this.toastMessageService.showSnackBar(MESSAGE_TPYE.ERROR, errorMsg);
          return;
        }
        let msg = data.message;
        if (type === 'Publish') {
          msg = SUCCESS_MESSAGE.PUBLISHED;
          msg = msg.replace(
            '<programName>',
            this.programResponseData.programName
          );
        }
        if (type === RP_ALERTS.UNPUBLISH && msg === '') {
          msg = SUCCESS_MESSAGE.UNPUBLISHED;
        }
        if (type !== RP_ALERTS.LEAVE_PROGRAM) {
          this.toastMessageService.showSnackBar(MESSAGE_TPYE.INFO, msg, false);
        }
        const url = this.activeTab
          ? `/programs/${this.activeTab}`
          : `/programs`;
        redirectUrl(this.router, url);
      },
      (error: Error) => {
        const msg = displayErrorMessage(error);
        this.toastMessageService.showSnackBar(MESSAGE_TPYE.ERROR, msg);
      }
    );
  }

  openAlert(data: AlertDialog) {
    this.matDialog.open(AlertDialogComponent, {
      panelClass: 'program-detail-alert-dialog',
      data,
    });
  }

  openAlertDialog(from: string, programName: string) {
    if (from === RP_ALERTS.UNPUBLISH) {
      this.openAlert({
        content: `Are you sure you want to unpublish ${programName || ''}?`,
        submitBtnText: 'OK',
        submitBtnFunc: () => this.programAction(RP_ALERTS.UNPUBLISH),
        cancelBtnText: 'Cancel',
      });
    }
  }

  openProgramModal(isDuplicate: boolean) {
    const programInfo = { ...this.programInfo };
    const navigateUrl = this.activeTab
      ? `/programs/${this.activeTab}`
      : `/programs`;
    const doc = document.documentElement;
    const left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    const top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    window.scroll(0, 0);
    const modal = this.matDialog.open(CreateProgramModalComponent, {
      height: '100%',
      panelClass: 'common-modal-container',
      data: { programInfo, isDuplicate, isEdit: !isDuplicate, navigateUrl },
      position: { right: '0' },
      disableClose: true,
      autoFocus: false,
    });
    modal.afterClosed().subscribe(() => {
      if (top !== 0 || left !== 0) {
        window.scroll({
          top,
          left,
          behavior: 'smooth',
        });
      }
    });
  }

  goToProgram() {
    if (this.routerService.previousUrl.indexOf('/draft') > -1) {
      redirectUrl(this.router, '/programs/draft');
    } else if (this.routerService.previousUrl.indexOf('/active') > -1) {
      redirectUrl(this.router, '/programs/active');
    } else if (this.routerService.previousUrl.indexOf('/closed') > -1) {
      redirectUrl(this.router, '/programs/closed');
    } else {
      redirectUrl(this.router, '/programs');
    }
  }

  redirectToHome() {
    redirectUrl(this.router, '/Admin');
  }
}

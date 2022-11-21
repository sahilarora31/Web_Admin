import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  AfterContentChecked,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MyDateAdapter } from '@shared/model/date.model';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MY_DATE_FORMATS,
  PROGRAM_BTN_TEXT,
  PROGRAM_HEADING_TEXT,
  PROGRAM_STATUS,
  PROGRAM_TYPE,
  PROGRAM_TYPE_DISPLAY,
  REMINDER_LIST,
  RP_ALERTS,
  SUCCESS_MESSAGE,
} from '@shared/constants/program.constants';
import { MatDrawer } from '@angular/material/sidenav';
import { Program, SearchHeading } from '@shared/model/program.model';
import { Observable } from 'rxjs';
import {
  AlertDialog,
  AlertDialogComponent,
} from '@shared/components/alert-dialog/alert-dialog.component';
import {
  displayErrorMessage,
  getLocalDate,
  getStartDateTime,
  getTimeZone,
  getUTCEodDateTime,
  hidePageScroll,
  redirectUrl,
} from '@shared/classes/util';
import { EngageTitle } from '@shared/model/book.model';
import { EngageService } from '@shared/services/engage.service';
import { SearchTitleComponent } from '@shared/components/search-title/search-title.component';
import { ToastMessageService } from '@shared/services/toast-message.service';
import { MESSAGE_TPYE } from '@shared/constants/common.constants';
import { SpinnerService } from '@shared/services/spinner.service';
import { User } from '@shared/model/user.model';

@Component({
  selector: 'axis360-create-program-modal',
  templateUrl: './create-program-modal.component.html',
  styleUrls: ['./create-program-modal.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MyDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class CreateProgramModalComponent
  implements OnInit, AfterViewInit, AfterContentChecked
{
  @ViewChild('searchTitleScreen') searchTitleScreen: MatDrawer;
  searchResult = false;
  programTypeList = PROGRAM_TYPE_DISPLAY;
  reminderList: string[] = REMINDER_LIST;
  minDate: string | Date;
  maxDate = new Date();
  maxReadByDate = new Date();
  minReadByDate: string | Date;
  setenddate: Date;
  createProgramForm: FormGroup;
  showRemoveUserButton = false;
  isBookInvalid = false;
  getStartDate: string;
  titleType = 'Program';
  programId: string;
  programEndDate: string;
  submitProgramBtnText = PROGRAM_BTN_TEXT.CREATE;
  isEdit = false;
  headingText: string;
  publish = false;
  unpublish = false;
  RP_ALERTS = RP_ALERTS;
  isSubmitted = false;
  previousTitle: EngageTitle[] = [];
  isProgramStarted = false;
  isDeletable = false;
  participants: User[] = [];
  isProgramTypeError = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public modaldata: any,
    public programDialog: MatDialogRef<CreateProgramModalComponent>,
    public matDialog: MatDialog,
    private formBuilder: FormBuilder,
    public engageService: EngageService,
    private router: Router,
    private changeDect: ChangeDetectorRef,
    public toastMessage: ToastMessageService,
    public spinnerService: SpinnerService
  ) {}

  ngOnInit(): void {
    const readdate = new Date();
    this.maxDate.setFullYear(readdate.getFullYear(), readdate.getMonth() + 12);
    this.maxReadByDate.setFullYear(
      readdate.getFullYear(),
      readdate.getMonth() + 12
    );
    const ProgramData: Program = this.modaldata.programInfo;
    this.programId = ProgramData.programId || '';
    this.participants = ProgramData.participants || [];
    if (this.programId.length > 1) {
      ProgramData.startDate = getLocalDate(ProgramData.startDate);
      ProgramData.readByDate = getLocalDate(ProgramData.readByDate);
    }
    this.createProgramForm = this.formBuilder.group({
      programName: [
        ProgramData.programName,
        [Validators.required, this.noWhitespace],
      ],
      description: [ProgramData.description || ''],
      isPublic: [ProgramData.isPublic?.toString()],
      reminderFrequency: [ProgramData.reminderFrequency],
      programType: [ProgramData.programType],
      numberOfBooks: [ProgramData.numberOfBooks, Validators.required],
      publishProgram: [ProgramData.publishProgram || false],
      startDate: [ProgramData.startDate],
      readByDate: [ProgramData.readByDate],
    });
    this.engageService.title = [];
    this.isEdit = this.modaldata.isEdit;
    if (ProgramData.engageTitle?.length) {
      ProgramData.engageTitle.forEach((bookDetail: EngageTitle) => {
        const titleDetail = {
          ...bookDetail,
          index: this.engageService.title.length,
        };
        this.engageService.title.push(titleDetail);
      });
      this.previousTitle = [...this.engageService.title];
    }
    this.isProgramStarted =
      this.isEdit &&
      ProgramData.status === PROGRAM_STATUS.ACTIVE &&
      new Date(ProgramData.startDate) <= new Date();
    this.submitProgramBtnText = this.isEdit
      ? PROGRAM_BTN_TEXT.EDIT
      : PROGRAM_BTN_TEXT.CREATE;
    this.headingText = this.isEdit
      ? PROGRAM_HEADING_TEXT.EDIT
      : PROGRAM_HEADING_TEXT.CREATE;
    this.publish =
      this.isEdit && ProgramData.status !== PROGRAM_STATUS.UNPUBLISHED;
    this.unpublish =
      this.isEdit && ProgramData.status === PROGRAM_STATUS.UNPUBLISHED;
    this.minDate =
      new Date(ProgramData.startDate) < new Date()
        ? ProgramData.startDate
        : new Date();
    this.isDeletable =
      this.isEdit &&
      (ProgramData.status === PROGRAM_STATUS.DRAFT ||
        ProgramData.status === PROGRAM_STATUS.UNPUBLISHED);
    this.programDialog.backdropClick().subscribe(() => {
      this.openAlertDialog(RP_ALERTS.CLOSE);
    });
  }

  ngAfterContentChecked() {
    this.changeDect.detectChanges();
  }
  ngAfterViewInit() {
    this.searchTitleScreen.openedStart.subscribe(() => {
      document
        .getElementsByTagName('html')[0]
        .classList.add('search-title-result');
    });
    this.programDialog.afterOpened().subscribe(() => hidePageScroll());
    this.programDialog.afterClosed().subscribe(() => {
      document
        .getElementsByTagName('html')[0]
        .classList.remove('search-title-result');
      hidePageScroll(false);
    });
    this.selectProgramType();
    this.router.events.subscribe(() => {
      this.programDialog.close();
    });
  }

  selectProgramType() {
    document
      .getElementsByClassName('programType')[0]
      .removeAttribute('aria-multiselectable');
    document
      .getElementsByClassName('pro-reminder-sel')[0]
      .removeAttribute('aria-multiselectable');
  }

  openSearchDialog() {
    document.getElementsByTagName('html')[0].classList.add('header-search');
    const searchHeading: SearchHeading = {
      title: this.createProgramForm.controls.programName.value,
      subTitle: 'Find titles and add them to your program',
    };
    const dialogRef = this.matDialog.open(SearchTitleComponent, {
      ariaLabel: 'Search modal dialog',
      data: searchHeading,
      width: '100vw',
      height: '100vh',
    });
    dialogRef.afterClosed().subscribe((searchHappen) => {
      document
        .getElementsByTagName('html')[0]
        .classList.remove('header-search');
      if (searchHappen) {
        this.searchTitleShow();
      }
    });
  }
  searchTitleShow() {
    if (window.innerWidth < 700) {
      this.searchResult = true;
    }
    this.searchTitleScreen.open();
  }
  isInValid() {
    return (
      this.isSubmitted &&
      ((!this.publish &&
        this.createProgramForm.hasError('required', 'programName')) ||
        (this.publish &&
          (this.createProgramForm.hasError('required', 'programName') ||
            (this.engageService.title &&
              this.engageService.title.length === 0) ||
            this.createProgramForm.hasError('required', 'startDate') ||
            this.createProgramForm.hasError('min', 'startDate') ||
            this.createProgramForm.hasError('required', 'readByDate') ||
            this.createProgramForm.hasError('min', 'readByDate'))))
    );
  }

  submitProgram(publish: boolean) {
    this.isSubmitted = true;
    this.createProgramForm.get('programName').markAsTouched();
    this.createProgramForm.get('programName').markAsDirty();
    this.publish = publish;
    if (
      publish &&
      (this.createProgramForm.get('programType').value === '')
    ) {
      this.isProgramTypeError =
        this.createProgramForm.get('programType').value === '';
      return;
    }
    if (!publish && this.disableSaveAction()) {
      return;
    }
    if (publish && this.disablePublishAction()) {
      return;
    }
    const ProgramData = this.formatProgramForm(publish);
    let submitProgramCall: Observable<any> =
      this.engageService.createReadingProgram(ProgramData);
    if (
      !this.modaldata.isDuplicate &&
      this.modaldata.programInfo.programId.length > 1
    ) {
      ProgramData.programId = this.modaldata.programInfo.programId;
      submitProgramCall = this.engageService.updateReadingProgram(ProgramData);
    }
    this.spinnerService.withObservable(submitProgramCall, true).subscribe(
      (data) => {
        if (data && data.responseCode === 200) {
          this.successRedirect(publish, data.programId);
        } else {
          const msg = displayErrorMessage(data);
          this.toastMessage.showSnackBar(MESSAGE_TPYE.ERROR, msg);
        }
      },
      (error) => {
        const msg = displayErrorMessage(error);
        this.toastMessage.showSnackBar(MESSAGE_TPYE.ERROR, msg);
      }
    );
  }

  formatProgramForm(publishProgram: boolean) {
    const startDate = this.createProgramForm.get('startDate')?.value;
    const readByDate = this.createProgramForm.get('readByDate')?.value;
    const books = [];
    for (let i = 0; i < this.engageService.title.length; i++) {
      books.push({
        bookId: this.engageService.title[i].bookId,
        sequence: i + 1,
      });
    }
    const participants = [];
    this.participants.forEach((participant) => {
      participants.push({
        userGuid: participant.userGuid,
      });
    });
    const ProgramData: Program = { ...this.createProgramForm.value };
    ProgramData.programName = ProgramData.programName.trim();
    ProgramData.books = books;
    ProgramData.participants = participants;
    ProgramData.timeZone = getTimeZone(true);
    ProgramData.startDate = startDate ? getStartDateTime(startDate) : '';
    ProgramData.readByDate = readByDate ? getUTCEodDateTime(readByDate) : '';
    ProgramData.publishProgram =
      this.modaldata.programInfo.status === PROGRAM_STATUS.UNPUBLISHED &&
      !this.modaldata.isDraft &&
      !this.modaldata.isDuplicate
        ? false
        : publishProgram;
    return ProgramData;
  }

  successRedirect(publish: boolean, programId: string) {
    let msg;
    const url = publish ? `/program/${programId}` : '/programs';
    if (publish && this.programId.length > 1) {
      msg = this.isEdit ? SUCCESS_MESSAGE.UPDATED : SUCCESS_MESSAGE.PUBLISHED;
    } else {
      msg = publish ? SUCCESS_MESSAGE.CREATED : SUCCESS_MESSAGE.SAVED;
    }
    msg = msg.replace(
      '<programName>',
      this.createProgramForm.get('programName')?.value
    );
    this.toastMessage.showSnackBar(MESSAGE_TPYE.SUCCESS, msg);
    this.programDialog.close();
    this.matDialog.closeAll();
    redirectUrl(
      this.router,
      url,
      !publish || this.isEdit || this.modaldata.isDuplicate
    );
  }

  closeDialog() {
    this.programDialog.close();
  }

  cancelFn() {
    const btn = document.getElementById('cprog-close-2');
    if (btn) {
      btn.click();
    }
  }

  showNoOfBooks() {
    return (
      this.createProgramForm.get('programType')?.value ===
      PROGRAM_TYPE.XOfYOfBooks
    );
  }

  startDateChanges() {
    const startDate = this.createProgramForm.get('startDate')?.value;
    const endDate = this.createProgramForm.get('readByDate')?.value;
    this.setenddate = startDate;
    if (startDate > endDate) {
      const read = this.createProgramForm.get('readByDate');
      if (read) {
        read.setValue('');
      }
    }
    this.minReadByDate = new Date(startDate);
    this.maxReadByDate.setFullYear(
      startDate.getFullYear(),
      startDate.getMonth() + 12,
      startDate.getDate()
    );
  }

  disableSaveAction() {
    return this.createProgramForm.get('programName')?.invalid;
  }

  disablePublishAction() {
    const minTitleCount = this.showNoOfBooks()
      ? this.createProgramForm.get('numberOfBooks')?.value
      : 1;
    return (
      this.createProgramForm.status === 'INVALID' ||
      this.engageService.title.length < minTitleCount
    );
  }

  deleteProgram() {
    this.spinnerService
      .withObservable(this.engageService.deleteProgram(this.programId), true)
      .subscribe(
        (data) => {
          if (data && data.responseCode === 200) {
            this.programDialog.close();
            this.matDialog.closeAll();
            redirectUrl(
              this.router,
              this.modaldata.redirectUrl || '/programs',
              true
            );
            this.toastMessage.showSnackBar(MESSAGE_TPYE.SUCCESS, data.message);
          } else {
            const msg = displayErrorMessage(data);
            this.toastMessage.showSnackBar(MESSAGE_TPYE.ERROR, msg);
          }
        },
        (error) => {
          const msg = displayErrorMessage(error);
          this.toastMessage.showSnackBar(MESSAGE_TPYE.ERROR, msg);
        }
      );
  }

  openAlert(data: AlertDialog) {
    this.matDialog.open(AlertDialogComponent, {
      panelClass: 'mat-alert-dialog',
      data,
    });
  }

  handleCloseAlert() {
    const isSameTitle =
      this.previousTitle.length === this.engageService.title.length &&
      this.previousTitle.map((book) => book.bookId).join(',') ===
        this.engageService.title.map((book) => book.bookId).join(',');
    if (!this.createProgramForm.touched && isSameTitle) {
      this.closeDialog();
      return;
    }
    this.openAlert({
      content: 'Are you sure you want to discard the changes made?',
      submitBtnText: 'OK',
      submitBtnFunc: this.closeDialog.bind(this),
      cancelBtnText: 'Cancel',
    });
  }
  openAlertDialog(from: string, dataObj?: EngageTitle) {
    if (from === RP_ALERTS.CLOSE) {
      this.handleCloseAlert();
    } else if (from === RP_ALERTS.REMOVE_TITLE) {
      this.matDialog.open(AlertDialogComponent, {
        panelClass: 'mat-alert-dialog',
        data: {
          content: `Are you sure you want to remove ${dataObj.Title || ''}?`,
          submitBtnText: 'Remove',
          submitBtnFunc: () => this.removeTitle.bind(this)(dataObj),
          cancelBtnText: 'Cancel',
        },
      });
    } else {
      this.openAlert({
        content: 'Are you sure you want to delete this program?',
        submitBtnText: 'OK',
        submitBtnFunc: this.deleteProgram.bind(this),
        cancelBtnText: 'Cancel',
      });
    }
  }
  public noWhitespace(control: AbstractControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    return !isWhitespace ? null : { whitespace: true };
  }

  titleReIndex = () => {
    this.engageService.titleReIndex();
  };

  deleteTitleAction = (data: EngageTitle) => {
    this.openAlertDialog(RP_ALERTS.REMOVE_TITLE, data);
  };

  removeTitle = (data: EngageTitle) => {
    this.engageService.removeTitle(data.bookId);
    const noOfBooksSelected =
      this.createProgramForm.get('numberOfBooks')?.value;
    if (this.engageService.title.length < noOfBooksSelected) {
      const book = this.createProgramForm.get('numberOfBooks');
      if (book) {
        book.setValue(this.engageService.title.length);
      }
    }
    const titles = this.engageService.title;
    this.engageService.title = [];
    setTimeout(() => {
      this.engageService.title = titles;
    });
  };

  closeSearchResult() {
    this.searchResult = false;
    this.searchTitleScreen.close();
  }

  onProgramTypeChange() {
    this.isProgramTypeError = false;
  }
  startDateToggle() {
    if (
      this.modaldata.programInfo.status === PROGRAM_STATUS.DRAFT ||
      this.modaldata.programInfo.status === PROGRAM_STATUS.UNPUBLISHED ||
      this.modaldata.isDuplicate
    ) {
      const startDate = this.createProgramForm.get('startDate')?.value;
      if (new Date(startDate) < new Date()) {
        this.minDate = new Date();
        this.createProgramForm.get('startDate').setValue(new Date());
        this.startDateChanges();
      }
    }
  }
}

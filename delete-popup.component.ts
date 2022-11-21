import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PartnerManagementService } from '../../service/partner-management.service';

@Component({
  selector: 'axis360-delete-popup',
  templateUrl: './delete-popup.component.html',
  styleUrls: ['./delete-popup.component.scss']
})
export class DeletePopupComponent implements OnInit {
  @Input() header: string;
  @Input() body_content1: string;
  @Input() body_content2: string;
  @Input() cancelButtonText: string;
  @Input() submitButtonText: string;

  constructor(public service: PartnerManagementService,
    public deleteDialog: MatDialogRef<DeletePopupComponent>
    ) { }

  ngOnInit(): void {
    this.header = this.service.popup.header;
    this.body_content1 = this.service.popup.body_content1;
    this.body_content2 = this.service.popup.body_content2;
    this.cancelButtonText = this.service.popup.cancelButtonText;
    this.submitButtonText = this.service.popup.submitButtonText;
  }

  submitClick() {
    this.deleteDialog.close('YES');
  }

  cancelClick() {
    this.deleteDialog.close('NO');
  }
}

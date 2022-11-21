import { Component, OnInit } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { PartnerManagementService } from '../../service/partner-management.service';

@Component({
  selector: 'axis360-action-button',
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.scss']
})
export class ActionButtonComponent implements OnInit {
  params!: ICellRendererParams;
  constructor(public service: PartnerManagementService) { }

  ngOnInit(): void {
  }

  isLocationGrid() {
    return this.service.isLocationsGrid;
  }

  agInit(rendererParams: ICellRendererParams): void {
    this.params = rendererParams;
  }

  invokeGridAction(action: string) {
    this.params?.context?.componentParent?.saveLocation({
      Action: action,
      Row: this.params.node.rowIndex,
      Col: this.params.data
    });
  }
}

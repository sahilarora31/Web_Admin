import { APP_BASE_HREF } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigService } from '@shared/services/config.service';
import { RouterService } from '@shared/services/router.service';
import { SpinnerService } from '@shared/services/spinner.service';
import { UserService } from '@shared/services/user.service';

import { MainComponent } from './main.component';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let configService: ConfigService;
  let userService: UserService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        SpinnerService,
        ConfigService,
        UserService,
        RouterService,
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
      declarations: [MainComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    configService = TestBed.inject(ConfigService);
    userService = TestBed.inject(UserService);
    spyOn(configService, 'getLibrarySettings').and.resolveTo();
    spyOn(userService, 'getCurrentUser').and.resolveTo();
    configService.currentLibrary = { ProgramEnabled: true };
    userService.currentUser = { userName: 'BoT', accessProgram: true };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

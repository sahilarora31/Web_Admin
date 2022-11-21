import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ConfigService } from '@shared/services/config.service';
import { RouterService } from '@shared/services/router.service';
import { SpinnerService } from '@shared/services/spinner.service';
import { UserService } from '@shared/services/user.service';

@Component({
  selector: 'axis360-main',
  templateUrl: './main.component.html',
})
export class MainComponent implements OnInit, AfterViewInit {
  previousUrl = '';
  currentUrl = '';
  constructor(
    private spinnerService: SpinnerService,
    private configService: ConfigService,
    private userService: UserService,
    private router: Router,
    private routerService: RouterService
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
        this.routerService.previousUrl = this.previousUrl;
        this.routerService.currentUrl = this.currentUrl;
      });
    this.getLibrarySettings();
  }

  ngAfterViewInit() {
    this.setMainContentHeight();
  }

  /**
   * To get Library Settings and User from API
   */
  async getLibrarySettings() {
    this.spinnerService.showLoader();
    await Promise.all([
      this.configService.getLibrarySettings(),
      this.userService.getCurrentUser(),
    ]);
    this.routeCheck();
    this.spinnerService.showLoader(false);
  }

  /**
   *
   * To check route and redirect
   */
  routeCheck() {
    if (
      this.router.url.indexOf('/program') > -1 &&
      (!this.configService.currentLibrary.ProgramEnabled ||
        !this.userService.currentUser.accessProgram)
    ) {
      this.redirectToHome();
    }
  }

  /**
   * Redirect to home page
   */
  redirectToHome = () => {
    window.location.href = '/Admin';
  };

  /**
   * Set main content height to set the footer in the bottom
   */
  setMainContentHeight = () => {
    const headerHeight =
      document.getElementsByTagName('header')[0]?.offsetHeight || 0;
    const headerSeparatorHeight =
      document.getElementById('headerseparator')?.offsetHeight || 0;
    const footerHeight = document.getElementById('footer')?.offsetHeight || 52;
    const viewPortHeight = window.innerHeight;
    const mainContentHeight =
      viewPortHeight - (headerHeight + headerSeparatorHeight + footerHeight);
    document
      .getElementById('mainContent')
      ?.setAttribute('style', `min-height: ${mainContentHeight}px`);
  };

  /**
   * Set the main conetnt height when window resize
   */
  @HostListener('window:resize')
  onResize() {
    this.setMainContentHeight();
  }
}

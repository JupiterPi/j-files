import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../auth.service";
import {UserService} from "../../user.service";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  isLoggedIn = false;

  constructor(
    private router: Router,
    private user: UserService,
    public auth: AuthService,
  ) {
    this.user.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }

  filename = "";
  submitFilename() {
    this.router.navigateByUrl(this.filename);
  }
}

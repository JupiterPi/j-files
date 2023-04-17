import {Component} from '@angular/core';
import {UserService} from "../../user.service";
import {Router} from "@angular/router";
import {AuthService} from "../../auth.service";

@Component({
  selector: 'app-bookmarks',
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.scss']
})
export class BookmarksComponent {
  bookmarks: string[] = [];
  hasWriteAccess = false;

  isLoggedIn = false;

  constructor(
    private user: UserService,
    public auth: AuthService,
    private router: Router,
  ) {
    this.user.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (!isLoggedIn) {
        this.bookmarks = [];
        this.hasWriteAccess = false;
      }
    });
    this.user.getUser().subscribe(user => {
      this.bookmarks = user.bookmarkedFiles;
      this.hasWriteAccess = user.hasWriteAccess;
    });
  }

  createFile() {
    const name = prompt("New file name:")?.replace(" ", "-");
    if (name) this.router.navigateByUrl(name);
  }
}

import {Component} from '@angular/core';
import {UserService} from "../../user.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-bookmarks',
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.scss']
})
export class BookmarksComponent {
  bookmarks: string[] = [];
  hasWriteAccess = false;

  constructor(
    private user: UserService,
    private router: Router,
  ) {
    this.user.getUser().subscribe(user => {
      this.bookmarks = user.bookmarkedFiles;
      this.hasWriteAccess = user.hasWriteAccess;
    });
  }

  createFile() {
    const name = prompt("New file name:")?.replace(" ", "-");
    if (name) this.router.navigate([name]);
  }
}

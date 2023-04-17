import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AngularFireStorage} from "@angular/fire/compat/storage";
import {UserService} from "../../user.service";

@Component({
  selector: 'app-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent {
  filename?: string;
  empty = false;
  files: string[] = [];
  hasWriteAccess = false;
  bookmarked?: boolean;

  constructor(
    private route: ActivatedRoute,
    private storage: AngularFireStorage,
    private user: UserService,
  ) {
    this.route.params.subscribe(params => {
      this.filename = params["file"];

      this.storage.ref("/files/" + this.filename).listAll().subscribe(data => {
        this.files = data.items.map(item => item.name);
        this.empty = this.files.length == 0;
      });

      this.user.getUser().subscribe(user => {
        this.hasWriteAccess = user.hasWriteAccess;
        this.bookmarked = user.bookmarkedFiles.includes(this.filename!);
      });
    });
  }

  toggleBookmark() {
    this.user.toggleBookmark(this.filename!);
  }

  openFile(file: string) {
    this.storage.ref("/files/" + this.filename + "/" + file).getDownloadURL().subscribe(url => {
      window.open(url);
    });
  }
}

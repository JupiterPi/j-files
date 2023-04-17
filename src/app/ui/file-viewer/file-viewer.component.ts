import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AngularFireStorage} from "@angular/fire/compat/storage";
import {UserService} from "../../user.service";
import {first} from "rxjs";
import {AuthService} from "../../auth.service";

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
  bookmarked = false;

  clickToDelete = false;

  constructor(
    private route: ActivatedRoute,
    private storage: AngularFireStorage,
    private user: UserService,
    private auth: AuthService,
  ) {
    this.route.params.subscribe(params => {
      this.filename = params["file"];

      this.loadFiles();

      this.user.getUser().subscribe(user => {
        this.hasWriteAccess = user.hasWriteAccess;
        this.bookmarked = user.bookmarkedFiles.includes(this.filename!);
      });
    });
  }
  private loadFiles() {
    this.storage.ref("/files/" + this.filename).listAll().subscribe(data => {
      this.files = data.items.map(item => item.name);
      this.empty = this.files.length == 0;
    });
  }

  toggleBookmark() {
    this.user.isLoggedIn$.pipe(first()).subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.user.toggleBookmark(this.filename!);
      } else {
        this.auth.login();
      }
    });
  }

  openFile(file: string) {
    this.storage.ref("/files/" + this.filename + "/" + file).getDownloadURL().subscribe(url => {
      window.open(url);
    });
  }

  deleteFile(file: string) {
    this.storage.ref("/files/" + this.filename + "/" + file).delete().subscribe(() => {
      this.loadFiles();
      setTimeout(() => {
        if (this.empty) this.clickToDelete = false;
      }, 500);
    });
  }

  deleteAll() {
    this.files.forEach(file => this.deleteFile(file));
    if (this.bookmarked) this.toggleBookmark();
  }

  uploadFiles(event: Event) {
    const target = event.target as HTMLInputElement;
    const fileList = target.files!;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i)!;
      const task = this.storage.upload("/files/" + this.filename + "/" + file.name, file);
      task.percentageChanges().subscribe(percentage => console.log(percentage));
      task.then(() => this.loadFiles());
    }

    if (!this.bookmarked) this.toggleBookmark();
  }
}

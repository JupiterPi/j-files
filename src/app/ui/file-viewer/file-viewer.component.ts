import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AngularFireStorage} from "@angular/fire/compat/storage";
import {CacheMap} from "../../../util";
import {BehaviorSubject, Observable} from "rxjs";

@Component({
  selector: 'app-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent {
  filename?: string;
  empty = false;
  files: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private storage: AngularFireStorage,
  ) {
    this.route.params.subscribe(params => {
      this.filename = params["file"];

      this.storage.ref("/files/" + this.filename).listAll().subscribe(data => {
        this.files = data.items.map(item => item.name);
        this.empty = this.files.length == 0;
      });
    });
  }

  downloadUrls = new CacheMap<string, Observable<string>>(file => {
    const s = new BehaviorSubject("");
    this.storage.ref("/files/" + this.filename + "/" + file).getDownloadURL().subscribe(url => {
      s.next(url);
    });
    return s;
  });
}

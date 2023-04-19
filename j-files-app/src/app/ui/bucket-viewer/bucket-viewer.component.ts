import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AngularFireStorage} from "@angular/fire/compat/storage";
import {UserService} from "../../user.service";
import {first} from "rxjs";
import {AuthService} from "../../auth.service";
import {Bucket, BucketsService} from "../../buckets.service";

@Component({
  selector: 'app-bucket-viewer',
  templateUrl: './bucket-viewer.component.html',
  styleUrls: ['./bucket-viewer.component.scss']
})
export class BucketViewerComponent {
  bucketName?: string;
  bucket?: Bucket;
  bucketFiles: string[] = [];
  bookmarked = false;

  userHasWriteAccess = false;
  get hasBucketWriteAccess() {
    return this.userHasWriteAccess || (this.bucket?.isWritable ?? false);
  }

  clickToDelete = false;

  constructor(
    private route: ActivatedRoute,
    private buckets: BucketsService,
    private storage: AngularFireStorage,
    private user: UserService,
    private auth: AuthService,
  ) {
    this.route.params.subscribe(params => {
      this.bucketName = params["bucket"];

      this.buckets.getBucket(this.bucketName!).subscribe(bucket => {
        this.bucket = bucket;
      });

      this.loadFiles();

      this.user.getUser().subscribe(user => {
        this.userHasWriteAccess = user.hasWriteAccess;
        this.bookmarked = user.bookmarkedBuckets.includes(this.bucketName!);
      });
    });
  }
  private loadFiles() {
    const storagePath = this.buckets.getStoragePath(this.bucketName!);
    this.storage.ref(storagePath).listAll().subscribe(data => {
      this.bucketFiles = data.items.map(item => item.name);
    });
  }

  toggleBookmark() {
    this.user.isLoggedIn$.pipe(first()).subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.user.toggleBookmark(this.bucketName!);
      } else {
        this.auth.login();
      }
    });
  }

  openFile(file: string) {
    const storagePath = this.buckets.getStoragePath(this.bucketName!);
    this.storage.ref(storagePath + "/" + file).getDownloadURL().subscribe(url => {
      window.open(url);
    });
  }

  deleteFile(file: string) {
    const storagePath = this.buckets.getStoragePath(this.bucketName!);
    this.storage.ref(storagePath + "/" + file).delete().subscribe(() => {
      this.loadFiles();
      setTimeout(() => {
        if (this.bucketFiles.length == 0) this.clickToDelete = false;
      }, 500);
    });
  }

  deleteAll() {
    this.bucketFiles.forEach(file => this.deleteFile(file));
    if (this.bookmarked) this.toggleBookmark();
  }

  uploadFiles(event: Event) {
    const target = event.target as HTMLInputElement;
    const fileList = target.files!;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i)!;

      const storagePath = this.buckets.getStoragePath(this.bucket!.name);
      const task = this.storage.upload(storagePath + "/" + file.name, file);
      task.then(() => this.loadFiles());
    }

    if (!this.bookmarked) this.toggleBookmark();
  }
}

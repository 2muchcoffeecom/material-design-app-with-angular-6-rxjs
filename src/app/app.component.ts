import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Subject, Subscription } from 'rxjs/index';
import { filter, switchMap } from 'rxjs/internal/operators';

import { DialogComponent } from './dialog/dialog.component';

export interface Buy {
  name: string;
  completed: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  shoppingList: Buy[] = [];

  addOrUpdate$: Subject<string> = new Subject<string>();
  delete$: Subject<string> = new Subject<string>();
  toggleStatus$: Subject<string> = new Subject<string>();

  addOrUpdateSubscription: Subscription;
  deleteSubscription: Subscription;
  updateSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
  ) {
    this.addOrUpdateSubscription = this.addOrUpdate$.pipe(
      switchMap((name = '') => {
        const dialogRef = this.dialog.open(DialogComponent, {
          data: { name },
        });
        return dialogRef.afterClosed();
      }),
      filter((data) => data && data.name && data.choose),
    )
    .subscribe((data) => {
      if (data.oldName) {
        this.shoppingList.map((buy) => {
          if (buy.name === data.oldName) {
            buy.name = data.name;
          }
        });
      } else {
        this.shoppingList.push({ name: data.name, completed: false });
      }
    });

    this.deleteSubscription = this.delete$
    .subscribe((name => {
      this.shoppingList = this.shoppingList.filter((buy) => buy.name !== name);
    }));

    this.updateSubscription = this.toggleStatus$
    .subscribe((name => {
      this.shoppingList.map((buy) => {
        if (buy.name === name) {
          buy.completed = !buy.completed;
        }
      });
    }));
  }

  ngOnDestroy() {
    this.addOrUpdateSubscription.unsubscribe();
    this.deleteSubscription.unsubscribe();
    this.updateSubscription.unsubscribe();
  }

  add() {
    this.addOrUpdate$.next();
  }

  delete(name: string) {
    this.delete$.next(name);
  }

  toggleStatus(name: string) {
    this.toggleStatus$.next(name);
  }

  update(name: string) {
    this.addOrUpdate$.next(name);
  }
}

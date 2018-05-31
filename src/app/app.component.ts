import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Observable, Subject, Subscription, of } from 'rxjs/index';
import { filter, switchMap, map, withLatestFrom } from 'rxjs/internal/operators';

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
  shoppingList$: Observable<Buy[]> = of([]);

  add$: Subject<null> = new Subject<null>();
  update$: Subject<{ name: string, index: number }> = new Subject<{ name: string, index: number }>();
  delete$: Subject<number> = new Subject<number>();
  toggleStatus$: Subject<number> = new Subject<number>();

  addSubscription: Subscription;
  updateSubscription: Subscription;
  deleteSubscription: Subscription;
  toggleStatusSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
  ) {
    this.addSubscription = this.add$.pipe(
      switchMap(() => {
        const dialogRef = this.dialog.open(DialogComponent, {
          data: { name: '' },
        });
        return dialogRef.afterClosed();
      }),
      filter((data) => data && data.name.trim() && data.choose),
      withLatestFrom(this.shoppingList$),
      map(([data, shoppingList]) => {
          shoppingList.push({ name: data.name, completed: false });
      }),
    )
    .subscribe();

    this.updateSubscription = this.update$.pipe(
      switchMap((data) => {
        const dialogRef = this.dialog.open(DialogComponent, {
          data,
        });
        return dialogRef.afterClosed();
      }),
      filter((data) => data && data.name.trim() && data.choose),
      withLatestFrom(this.shoppingList$),
      map(([data, shoppingList]) => {
        shoppingList[data.index].name = data.name;
      }),
    )
    .subscribe();

    this.deleteSubscription = this.delete$.pipe(
      withLatestFrom(this.shoppingList$),
      map(([index, shoppingList]) => {
        shoppingList.splice(index, 1);
      }),
    )
    .subscribe();

    this.toggleStatusSubscription = this.toggleStatus$.pipe(
      withLatestFrom(this.shoppingList$),
      map(([index, shoppingList]) => {
        shoppingList[index].completed = !shoppingList[index].completed;
      }),
    )
    .subscribe();
  }

  ngOnDestroy() {
    this.addSubscription.unsubscribe();
    this.updateSubscription.unsubscribe();
    this.deleteSubscription.unsubscribe();
    this.toggleStatusSubscription.unsubscribe();
  }

  add() {
    this.add$.next();
  }

  delete(index: number) {
    this.delete$.next(index);
  }

  toggleStatus(index: number) {
    this.toggleStatus$.next(index);
  }

  update(name: string, index: number) {
    this.update$.next({ name, index });
  }
}

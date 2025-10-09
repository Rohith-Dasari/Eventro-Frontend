import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddShowDialogComponent } from './add-show-dialog.component';

describe('AddShowDialogComponent', () => {
  let component: AddShowDialogComponent;
  let fixture: ComponentFixture<AddShowDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddShowDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddShowDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

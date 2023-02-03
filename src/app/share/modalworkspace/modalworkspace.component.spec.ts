import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalworkspaceComponent } from './modalworkspace.component';

describe('ModalworkspaceComponent', () => {
  let component: ModalworkspaceComponent;
  let fixture: ComponentFixture<ModalworkspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalworkspaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalworkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

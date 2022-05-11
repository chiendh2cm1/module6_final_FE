import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceHomeComponent } from './workspace-home.component';

describe('WorkspacehomeComponent', () => {
  let component: WorkspaceHomeComponent;
  let fixture: ComponentFixture<WorkspaceHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkspaceHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

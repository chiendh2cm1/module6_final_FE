import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceSettingComponent } from './workspace-setting.component';

describe('WorkspaceSettingComponent', () => {
  let component: WorkspaceSettingComponent;
  let fixture: ComponentFixture<WorkspaceSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkspaceSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

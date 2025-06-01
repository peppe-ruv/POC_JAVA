import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistanceRequestComponent } from './assistance-request.component';

describe('AssistanceRequestComponent', () => {
  let component: AssistanceRequestComponent;
  let fixture: ComponentFixture<AssistanceRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistanceRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssistanceRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

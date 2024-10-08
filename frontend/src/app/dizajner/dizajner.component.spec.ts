import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DizajnerComponent } from './dizajner.component';

describe('DizajnerComponent', () => {
  let component: DizajnerComponent;
  let fixture: ComponentFixture<DizajnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DizajnerComponent]
    });
    fixture = TestBed.createComponent(DizajnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

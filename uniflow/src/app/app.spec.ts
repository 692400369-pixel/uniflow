import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it('should have the correct default page', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app.currentPage).toBe('dashboard');
  });

  it('should calculate GPA correctly', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app.calculatedGPA).toBeGreaterThan(0);
    expect(app.calculatedGPA).toBeLessThanOrEqual(4);
  });

  it('should have courses', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app.courses.length).toBeGreaterThan(0);
  });

  it('should have assignments', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app.assignments.length).toBeGreaterThan(0);
  });

  it('should navigate between pages', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.setPage('courses');

    expect(app.currentPage).toBe('courses');

    app.setPage('assignments');

    expect(app.currentPage).toBe('assignments');

    app.setPage('dashboard');

    expect(app.currentPage).toBe('dashboard');
  });

});
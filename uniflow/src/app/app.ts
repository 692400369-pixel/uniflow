import {
  Component,
  signal,
  computed,
  OnDestroy
} from '@angular/core';

import { FormsModule } from '@angular/forms';


type Page =
  | 'dashboard'
  | 'courses'
  | 'assignments'
  | 'schedule'
  | 'goals'
  | 'focus'
  | 'gpa';

type Color =
  | 'purple'
  | 'blue'
  | 'green'
  | 'orange'
  | 'pink';


interface Course {
  _id?: string;
  name: string;
  code: string;
  instructor: string;
  schedule: string;
  progress: number;
  icon: string;
  color: Color;
}

interface Assignment {
  _id?: string;
  title: string;
  course: string;
  courseCode: string;
  due: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  progress: number;
}

interface ScheduleItem {
  _id?: string;
  day: string;
  date: string;
  time: string;
  period: string;
  course: string;
  code: string;
  instructor: string;
  room: string;
  color: Color;
}

interface Goal {
  _id?: string;
  title: string;
  description: string;
  category:
    | 'Development'
    | 'Study'
    | 'Learning'
    | 'Academic';
  deadline: string;
  progress: number;
  completed: boolean;
}

interface GPACourse {
  _id?: string;
  name: string;
  credit: number;
  grade: string;
}


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {

  /* =====================================================
     AUTH
  ===================================================== */

  isLoggedIn = signal(
    !!localStorage.getItem('token')
  );

  loginEmail = '';
  loginPassword = '';

  registerFirstName = '';
  registerLastName = '';
  registerEmail = '';
  registerPassword = '';

  showLogin = signal(false);
  showRegister = signal(false);

  authLoading = signal(false);


  openLogin(): void {
    this.showRegister.set(false);
    this.showLogin.set(true);
  }


  closeLogin(): void {
    this.showLogin.set(false);
  }


  openRegister(): void {
    this.showLogin.set(false);
    this.showRegister.set(true);
  }


  closeRegister(): void {
    this.showRegister.set(false);
  }


  async login(): Promise<void> {

    if (
      !this.loginEmail.trim() ||
      !this.loginPassword.trim()
    ) {
      alert('Please enter email and password.');
      return;
    }

    this.authLoading.set(true);

    try {

      const response = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.loginEmail.trim(),
            password: this.loginPassword
          })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
          'Invalid email or password.'
        );
        return;
      }

      localStorage.setItem(
        'token',
        result.token
      );

      this.isLoggedIn.set(true);

      if (result.user) {

        const firstName =
          result.user.firstName ||
          result.user.name ||
          'Ferial';

        this.studentName.set(firstName);

        localStorage.setItem(
          'studentName',
          firstName
        );
      }

      this.loginEmail = '';
      this.loginPassword = '';

      this.showLogin.set(false);

      await this.loadAllData();

      alert('Login successful ✅');

    } catch (error) {

      console.error(error);

      alert(
        'Cannot connect to backend.\n\n' +
        'Make sure backend is running on port 5000.'
      );

    } finally {

      this.authLoading.set(false);

    }
  }


  async register(): Promise<void> {

    if (
      !this.registerFirstName.trim() ||
      !this.registerLastName.trim() ||
      !this.registerEmail.trim() ||
      !this.registerPassword.trim()
    ) {
      alert('Please fill all registration fields.');
      return;
    }

    this.authLoading.set(true);

    try {

      const response = await fetch(
        'http://localhost:5000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            firstName: this.registerFirstName.trim(),
            lastName: this.registerLastName.trim(),
            email: this.registerEmail.trim(),
            password: this.registerPassword
          })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
          'Registration failed.'
        );
        return;
      }

      if (result.token) {

        localStorage.setItem(
          'token',
          result.token
        );

        this.isLoggedIn.set(true);

      }

      this.studentName.set(
        this.registerFirstName.trim()
      );

      localStorage.setItem(
        'studentName',
        this.registerFirstName.trim()
      );

      this.registerFirstName = '';
      this.registerLastName = '';
      this.registerEmail = '';
      this.registerPassword = '';

      this.showRegister.set(false);

      await this.loadAllData();

      alert(
        'Account created successfully ✅'
      );

    } catch (error) {

      console.error(error);

      alert(
        'Cannot connect to backend.'
      );

    } finally {

      this.authLoading.set(false);

    }
  }


  logout(): void {

    localStorage.removeItem('token');

    this.isLoggedIn.set(false);

    this.courses = [];
    this.assignments = [];
    this.goals = [];
    this.gpaCourses = [];
    this.schedule = [];

    this.currentPage.set('dashboard');

    alert('Logged out successfully.');

  }


  getToken(): string {

    return localStorage.getItem('token') || '';

  }


  /* =====================================================
     THEME
  ===================================================== */

  darkMode = signal(
    localStorage.getItem('theme') !== 'light'
  );


  toggleTheme(): void {

    this.darkMode.update(value => {

      const newValue = !value;

      localStorage.setItem(
        'theme',
        newValue ? 'dark' : 'light'
      );

      return newValue;

    });

  }


  /* =====================================================
     PROFILE
  ===================================================== */

  studentName = signal(
    localStorage.getItem(
      'studentName'
    ) || 'Ferial'
  );


  changeName(): void {

    const name = window.prompt(
      'Enter your name:',
      this.studentName()
    );

    if (name && name.trim()) {

      this.studentName.set(
        name.trim()
      );

      localStorage.setItem(
        'studentName',
        name.trim()
      );

    }

  }


  /* =====================================================
     NAVIGATION
  ===================================================== */

  currentPage = signal<Page>(
    'dashboard'
  );


  setPage(page: Page): void {

    this.currentPage.set(page);

    if (page === 'courses') {
      this.loadCourses();
    }

    if (page === 'assignments') {
      this.loadAssignments();
    }

    if (page === 'goals') {
      this.loadGoals();
    }

    if (page === 'gpa') {
      this.loadGPA();
    }

    if (page === 'schedule') {
      this.loadSchedule();
    }

  }


  /* =====================================================
     SEARCH
  ===================================================== */

  searchText = signal('');


  onSearch(value: string): void {

    this.searchText.set(value);

  }


  /* =====================================================
     REFRESH
  ===================================================== */

  private dataVersion = signal(0);


  private refreshData(): void {

    this.dataVersion.update(
      value => value + 1
    );

  }


  /* =====================================================
     COURSES
  ===================================================== */

  courses: Course[] = [];

  coursesLoading = signal(false);


  async loadCourses(): Promise<void> {

    const token = this.getToken();

    if (!token) return;

    this.coursesLoading.set(true);

    try {

      const response = await fetch(
        'http://localhost:5000/api/courses',
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error(result.message);
        return;
      }

      this.courses =
        result.courses || [];

      this.refreshData();

    } catch (error) {

      console.error(
        'Load courses error:',
        error
      );

    } finally {

      this.coursesLoading.set(false);

    }

  }


  filteredCourses = computed(() => {

    this.dataVersion();

    const search =
      this.searchText()
        .trim()
        .toLowerCase();

    if (!search) {
      return this.courses;
    }

    return this.courses.filter(course =>
      course.name
        .toLowerCase()
        .includes(search) ||

      course.code
        .toLowerCase()
        .includes(search) ||

      course.instructor
        .toLowerCase()
        .includes(search)
    );

  });


  averageProgress = computed(() => {

    this.dataVersion();

    if (!this.courses.length) {
      return 0;
    }

    const total =
      this.courses.reduce(
        (sum, course) =>
          sum + Number(course.progress || 0),
        0
      );

    return Math.round(
      total / this.courses.length
    );

  });


  async addCourse(): Promise<void> {

    const name =
      window.prompt(
        'Enter course name:'
      );

    if (!name?.trim()) return;

    const code =
      window.prompt(
        'Enter course code:'
      );

    if (!code?.trim()) return;

    const instructor =
      window.prompt(
        'Enter instructor name:',
        'Instructor'
      ) || 'Instructor';

    const schedule =
      window.prompt(
        'Enter schedule:',
        'TBA'
      ) || 'TBA';

    const colors: Color[] = [
      'purple',
      'blue',
      'green',
      'orange',
      'pink'
    ];

    const newCourse = {

      name: name.trim(),

      code:
        code.trim().toUpperCase(),

      instructor:
        instructor.trim(),

      schedule:
        schedule.trim(),

      progress: 0,

      icon:
        code
          .trim()
          .substring(0, 3)
          .toUpperCase(),

      color:
        colors[
          this.courses.length %
          colors.length
        ]

    };

    const token = this.getToken();

    if (!token) {
      alert('Please login first.');
      return;
    }

    try {

      const response = await fetch(
        'http://localhost:5000/api/courses',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Authorization:
              `Bearer ${token}`
          },
          body:
            JSON.stringify(newCourse)
        }
      );

      const result =
        await response.json();

      if (!response.ok || !result.success) {

        alert(
          result.message ||
          'Failed to add course.'
        );

        return;

      }

      this.courses.unshift(
        result.course
      );

      this.refreshData();

      alert(
        'Course added successfully ✅'
      );

    } catch (error) {

      console.error(error);

      alert(
        'Cannot connect to backend.'
      );

    }

  }


  async deleteCourse(
    index: number
  ): Promise<void> {

    const course =
      this.courses[index];

    if (!course?._id) return;

    if (
      !window.confirm(
        `Delete "${course.name}"?`
      )
    ) return;

    const token = this.getToken();

    try {

      const response =
        await fetch(
          `http://localhost:5000/api/courses/${course._id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const result =
        await response.json();

      if (!response.ok || !result.success) {

        alert(
          result.message ||
          'Failed to delete course.'
        );

        return;

      }

      this.courses.splice(index, 1);

      this.refreshData();

      alert(
        'Course deleted successfully ✅'
      );

    } catch (error) {

      console.error(error);

      alert(
        'Cannot connect to backend.'
      );

    }

  }


  viewCourse(course: Course): void {

    alert(
      `📚 ${course.name}\n\n` +
      `Code: ${course.code}\n` +
      `Instructor: ${course.instructor}\n` +
      `Schedule: ${course.schedule}\n` +
      `Progress: ${course.progress}%`
    );

  }


  /* =====================================================
     ASSIGNMENTS
  ===================================================== */

  assignments: Assignment[] = [];


  async loadAssignments(): Promise<void> {

    const token = this.getToken();

    if (!token) return;

    try {

      const response =
        await fetch(
          'http://localhost:5000/api/assignments',
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const result =
        await response.json();

      if (!response.ok || !result.success) {

        console.error(
          'Load assignments:',
          result.message
        );

        return;

      }

      this.assignments =
        result.assignments || [];

      this.refreshData();

    } catch (error) {

      console.error(error);

    }

  }


  pendingAssignments = computed(() => {

    this.dataVersion();

    return this.assignments.filter(
      assignment =>
        assignment.status !== 'Completed'
    ).length;

  });


  completedAssignments = computed(() => {

    this.dataVersion();

    return this.assignments.filter(
      assignment =>
        assignment.status === 'Completed'
    ).length;

  });


  notificationCount = 1;


  assignmentFilter = signal<
    'All' |
    'Pending' |
    'In Progress' |
    'Completed'
  >('All');


  setAssignmentFilter(
    filter:
      'All' |
      'Pending' |
      'In Progress' |
      'Completed'
  ): void {

    this.assignmentFilter.set(filter);

  }


  get visibleAssignments(): Assignment[] {

    this.dataVersion();

    const filter =
      this.assignmentFilter();

    if (filter === 'All') {
      return this.assignments;
    }

    return this.assignments.filter(
      assignment =>
        assignment.status === filter
    );

  }


  async addAssignment(): Promise<void> {

    const title =
      window.prompt(
        'Assignment title:'
      );

    if (!title?.trim()) return;

    const course =
      window.prompt(
        'Course name:',
        this.courses[0]?.name ||
        'Web Development'
      ) || 'Web Development';

    const due =
      window.prompt(
        'Deadline:',
        'Sep 15, 2026'
      ) || 'TBA';

    const priorityInput =
      window.prompt(
        'Priority: High / Medium / Low',
        'Medium'
      );

    let priority:
      'High' |
      'Medium' |
      'Low' = 'Medium';

    if (
      priorityInput
        ?.toLowerCase() === 'high'
    ) {
      priority = 'High';
    }

    if (
      priorityInput
        ?.toLowerCase() === 'low'
    ) {
      priority = 'Low';
    }

    const newAssignment = {

      title: title.trim(),

      course: course.trim(),

      courseCode:
        this.findCourseCode(course),

      due: due.trim(),

      priority,

      status: 'Pending',

      progress: 0

    };

    const token = this.getToken();

    try {

      const response =
        await fetch(
          'http://localhost:5000/api/assignments',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${token}`
            },
            body:
              JSON.stringify(
                newAssignment
              )
          }
        );

      const result =
        await response.json();

      if (!response.ok || !result.success) {

        alert(
          result.message ||
          'Failed to add assignment.'
        );

        return;

      }

      this.assignments.unshift(
        result.assignment
      );

      this.refreshData();

      alert(
        'Assignment added successfully ✅'
      );

    } catch (error) {

      console.error(error);

      alert(
        'Cannot connect to backend.'
      );

    }

  }


  async completeAssignment(
    assignment: Assignment
  ): Promise<void> {

    if (!assignment._id) return;

    const completed =
      assignment.status !== 'Completed';

    const body = {

      status:
        completed
          ? 'Completed'
          : 'Pending',

      progress:
        completed
          ? 100
          : 0

    };

    await this.updateAssignment(
      assignment,
      body
    );

  }


  private async updateAssignment(
    assignment: Assignment,
    body: any
  ): Promise<void> {

    const token = this.getToken();

    try {

      const response =
        await fetch(
          `http://localhost:5000/api/assignments/${assignment._id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${token}`
            },
            body:
              JSON.stringify(body)
          }
        );

      const result =
        await response.json();

      if (!response.ok || !result.success) {

        alert(
          result.message ||
          'Failed to update assignment.'
        );

        return;

      }

      Object.assign(
        assignment,
        result.assignment
      );

      this.refreshData();

    } catch (error) {

      console.error(error);

      alert(
        'Cannot connect to backend.'
      );

    }

  }


  async deleteAssignment(
    index: number
  ): Promise<void> {

    const assignment =
      this.visibleAssignments[index];

    if (!assignment?._id) return;

    if (
      !window.confirm(
        `Delete "${assignment.title}"?`
      )
    ) return;

    const token = this.getToken();

    try {

      const response =
        await fetch(
          `http://localhost:5000/api/assignments/${assignment._id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const result =
        await response.json();

      if (!response.ok || !result.success) {

        alert(
          result.message ||
          'Failed to delete assignment.'
        );

        return;

      }

      const realIndex =
        this.assignments.indexOf(
          assignment
        );

      if (realIndex !== -1) {
        this.assignments.splice(
          realIndex,
          1
        );
      }

      this.refreshData();

    } catch (error) {

      console.error(error);

    }

  }


  private findCourseCode(
    courseName: string
  ): string {

    const course =
      this.courses.find(
        item =>
          item.name.toLowerCase() ===
          courseName.trim().toLowerCase()
      );

    return course?.code ||
      courseName
        .trim()
        .substring(0, 2)
        .toUpperCase();

  }


  /* =====================================================
     GOALS
  ===================================================== */

  goals: Goal[] = [];


  async loadGoals(): Promise<void> {

    const token = this.getToken();

    if (!token) return;

    try {

      const response =
        await fetch(
          'http://localhost:5000/api/goals',
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const result =
        await response.json();

      if (!response.ok || !result.success) {

        console.error(
          result.message
        );

        return;

      }

      this.goals =
        result.goals || [];

      this.refreshData();

    } catch (error) {

      console.error(error);

    }

  }


  goalsProgress = computed(() => {

    this.dataVersion();

    if (!this.goals.length) {
      return 0;
    }

    return Math.round(
      this.goals.reduce(
        (sum, goal) =>
          sum + Number(goal.progress || 0),
        0
      ) / this.goals.length
    );

  });


  activeGoals = computed(() => {

    this.dataVersion();

    return this.goals.filter(
      goal => !goal.completed
    ).length;

  });


  completedGoals = computed(() => {

    this.dataVersion();

    return this.goals.filter(
      goal => goal.completed
    ).length;

  });


  async addGoal(): Promise<void> {

    const title =
      window.prompt(
        'Goal title:'
      );

    if (!title?.trim()) return;

    const description =
      window.prompt(
        'Goal description:'
      ) ||
      'Work hard and achieve your goal.';

    const deadline =
      window.prompt(
        'Deadline:',
        'Dec 31, 2026'
      ) || 'TBA';

    const categoryInput =
      window.prompt(
        'Category: Development / Study / Learning / Academic',
        'Study'
      );

    let category:
      'Development' |
      'Study' |
      'Learning' |
      'Academic' = 'Study';

    if (
      categoryInput
        ?.toLowerCase() ===
      'development'
    ) {
      category = 'Development';
    } else if (
      categoryInput
        ?.toLowerCase() ===
      'learning'
    ) {
      category = 'Learning';
    } else if (
      categoryInput
        ?.toLowerCase() ===
      'academic'
    ) {
      category = 'Academic';
    }

    const newGoal = {

      title: title.trim(),

      description:
        description.trim(),

      category,

      deadline:
        deadline.trim(),

      progress: 0,

      completed: false

    };

    const token = this.getToken();

    try {

      const response =
        await fetch(
          'http://localhost:5000/api/goals',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${token}`
            },
            body:
              JSON.stringify(newGoal)
          }
        );

      const result =
        await response.json();

      if (!response.ok || !result.success) {

        alert(
          result.message ||
          'Failed to add goal.'
        );

        return;

      }

      this.goals.unshift(
        result.goal
      );

      this.refreshData();

      alert(
        'Goal added successfully ✅'
      );

    } catch (error) {

      console.error(error);

    }

  }


  async increaseGoalProgress(
    goal: Goal
  ): Promise<void> {

    if (!goal._id || goal.completed) {
      return;
    }

    const progress =
      Math.min(
        100,
        Number(goal.progress || 0) + 10
      );

    await this.updateGoal(
      goal,
      {
        progress,
        completed: progress >= 100
      }
    );

  }


  async completeGoal(
    goal: Goal
  ): Promise<void> {

    if (!goal._id) return;

    await this.updateGoal(
      goal,
      {
        progress: 100,
        completed: true
      }
    );

  }


  private async updateGoal(
    goal: Goal,
    body: any
  ): Promise<void> {

    const token = this.getToken();

    try {

      const response =
        await fetch(
          `http://localhost:5000/api/goals/${goal._id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${token}`
            },
            body:
              JSON.stringify(body)
          }
        );

      const result =
        await response.json();

      if (!response.ok || !result.success) {

        alert(
          result.message ||
          'Failed to update goal.'
        );

        return;

      }

      Object.assign(
        goal,
        result.goal
      );

      this.refreshData();

    } catch (error) {

      console.error(error);

    }

  }


  async deleteGoal(
    index: number
  ): Promise<void> {

    const goal =
      this.goals[index];

    if (!goal?._id) return;

    if (
      !window.confirm(
        `Delete "${goal.title}"?`
      )
    ) return;

    const token = this.getToken();

    try {

      const response =
        await fetch(
          `http://localhost:5000/api/goals/${goal._id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const result =
        await response.json();

      if (!response.ok || !result.success) {

        alert(
          result.message ||
          'Failed to delete goal.'
        );

        return;

      }

      this.goals.splice(
        index,
        1
      );

      this.refreshData();

    } catch (error) {

      console.error(error);

    }

  }


  /* =====================================================
     GPA
  ===================================================== */

  gpaCourses: GPACourse[] = [];


  async loadGPA(): Promise<void> {

    const token = this.getToken();

    if (!token) return;

    try {

      const response =
        await fetch(
          'http://localhost:5000/api/gpa',
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const result =
        await response.json();

      if (!response.ok || !result.success) {

        console.error(
          result.message
        );

        return;

      }

      this.gpaCourses =
        result.courses ||
        result.gpaCourses ||
        [];

      this.refreshData();

    } catch (error) {

      console.error(error);

    }

  }


  gradePoints:
    Record<string, number> = {

      'A+': 4.0,
      'A': 4.0,
      'A-': 3.7,

      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,

      'C+': 2.3,
      'C': 2.0,
      'C-': 1.7,

      'D+': 1.3,
      'D': 1.0,

      'F': 0.0

    };


  get totalCredits(): number {

    return this.gpaCourses.reduce(
      (sum, course) =>
        sum +
        Number(course.credit || 0),
      0
    );

  }


  get totalGradePoints(): number {

    return this.gpaCourses.reduce(
      (sum, course) =>
        sum +
        Number(course.credit || 0) *
        (
          this.gradePoints[
            course.grade
          ] ?? 0
        ),
      0
    );

  }


  get calculatedGPA(): number {

    if (!this.totalCredits) {
      return 0;
    }

    return (
      this.totalGradePoints /
      this.totalCredits
    );

  }


  get gpaPercentage(): number {

    return (
      this.calculatedGPA / 4
    ) * 100;

  }


  get gpaStatus(): string {

    const gpa =
      this.calculatedGPA;

    if (gpa >= 3.7) {
      return 'Excellent';
    }

    if (gpa >= 3.0) {
      return 'Very Good';
    }

    if (gpa >= 2.0) {
      return 'Good';
    }

    if (gpa >= 1.0) {
      return 'Needs Improvement';
    }

    return 'Poor';

  }


  async addGPACourse(): Promise<void> {

    const newCourse = {

      name:
        window.prompt(
          'Course name:'
        ) || '',

      credit:
        Number(
          window.prompt(
            'Credit hours:',
            '3'
          )
        ) || 3,

      grade:
        window.prompt(
          'Grade:',
          'A'
        ) || 'A'

    };

    const token = this.getToken();

    try {

      const response =
        await fetch(
          'http://localhost:5000/api/gpa',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${token}`
            },
            body:
              JSON.stringify(newCourse)
          }
        );

      const result =
        await response.json();

      if (!response.ok || !result.success) {

        alert(
          result.message ||
          'Failed to add GPA course.'
        );

        return;

      }

      this.gpaCourses.push(
        result.course ||
        result.gpaCourse
      );

      this.refreshData();

    } catch (error) {

      console.error(error);

    }

  }


  async removeGPACourse(
    index: number
  ): Promise<void> {

    const course =
      this.gpaCourses[index];

    if (!course?._id) return;

    if (
      this.gpaCourses.length <= 1
    ) {
      return;
    }

    const token = this.getToken();

    try {

      const response =
        await fetch(
          `http://localhost:5000/api/gpa/${course._id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const result =
        await response.json();

      if (!response.ok || !result.success) {

        alert(
          result.message ||
          'Failed to delete GPA course.'
        );

        return;

      }

      this.gpaCourses.splice(
        index,
        1
      );

      this.refreshData();

    } catch (error) {

      console.error(error);

    }

  }


  /* =====================================================
     SCHEDULE
  ===================================================== */

  schedule: ScheduleItem[] = [];


  async loadSchedule(): Promise<void> {

    const token = this.getToken();

    if (!token) return;

    try {

      const response =
        await fetch(
          'http://localhost:5000/api/schedule',
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const result =
        await response.json();

      if (!response.ok || !result.success) {

        console.error(
          result.message
        );

        return;

      }

      this.schedule =
        result.schedule || [];

      this.refreshData();

    } catch (error) {

      console.error(error);

    }

  }


  get weeklySessions(): number {

    return this.schedule.length;

  }


  async addSchedule(): Promise<void> {

    const course =
      window.prompt(
        'Course name:',
        this.courses[0]?.name ||
        'Web Development'
      );

    if (!course?.trim()) return;

    const time =
      window.prompt(
        'Time:',
        '10:00'
      ) || '10:00';

    const periodInput =
      window.prompt(
        'AM or PM:',
        'AM'
      );

    const period =
      periodInput?.toUpperCase() ===
      'PM'
        ? 'PM'
        : 'AM';

    const room =
      window.prompt(
        'Room:',
        'Hall 1'
      ) || 'TBA';

    const code =
      this.findCourseCode(course);

    const foundCourse =
      this.courses.find(
        item =>
          item.code === code
      );

    const today =
      new Date();

    const newSchedule = {

      day: 'THU',

      date:
        String(
          today.getDate()
        ).padStart(2, '0'),

      time,

      period,

      course:
        course.trim(),

      code,

      instructor:
        foundCourse?.instructor ||
        'Instructor',

      room:
        room.trim(),

      color:
        foundCourse?.color ||
        'purple'

    };

    const token =
      this.getToken();

    try {

      const response =
        await fetch(
          'http://localhost:5000/api/schedule',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${token}`
            },
            body:
              JSON.stringify(
                newSchedule
              )
          }
        );

      const result =
        await response.json();

      if (!response.ok || !result.success) {

        alert(
          result.message ||
          'Failed to add schedule.'
        );

        return;

      }

      this.schedule.push(
        result.schedule
      );

      this.refreshData();

      alert(
        'Schedule added successfully ✅'
      );

    } catch (error) {

      console.error(error);

    }

  }


  /* =====================================================
     FOCUS
  ===================================================== */

  focusMode =
    signal<
      'Focus' |
      'Short Break' |
      'Long Break'
    >('Focus');


  focusRunning = signal(false);

  focusCompleted = 2;

  focusDuration = 25 * 60;

  focusRemaining =
    signal(
      this.focusDuration
    );


  private focusTimer:
    ReturnType<typeof setInterval> |
    null = null;


  selectFocusMode(
    mode:
      'Focus' |
      'Short Break' |
      'Long Break'
  ): void {

    this.pauseFocus();

    this.focusMode.set(mode);

    if (mode === 'Focus') {
      this.focusDuration = 25 * 60;
    }

    if (mode === 'Short Break') {
      this.focusDuration = 5 * 60;
    }

    if (mode === 'Long Break') {
      this.focusDuration = 15 * 60;
    }

    this.focusRemaining.set(
      this.focusDuration
    );

  }


  setFocusDuration(
    minutes: number
  ): void {

    this.pauseFocus();

    this.focusDuration =
      minutes * 60;

    this.focusRemaining.set(
      this.focusDuration
    );

    this.focusMode.set(
      'Focus'
    );

  }


  startFocus(): void {

    if (this.focusRunning()) {
      return;
    }

    this.focusRunning.set(true);

    this.focusTimer =
      setInterval(() => {

        const current =
          this.focusRemaining();

        if (current <= 0) {

          this.pauseFocus();

          this.focusCompleted++;

          alert(
            '🎉 Focus session completed!'
          );

          this.resetFocus();

          return;
        }

        this.focusRemaining.set(
          current - 1
        );

      }, 1000);

  }


  pauseFocus(): void {

    this.focusRunning.set(false);

    if (this.focusTimer !== null) {

      clearInterval(
        this.focusTimer
      );

      this.focusTimer = null;

    }

  }


  resetFocus(): void {

    this.pauseFocus();

    this.focusRemaining.set(
      this.focusDuration
    );

  }


  get focusTimeDisplay(): string {

    const total =
      this.focusRemaining();

    const minutes =
      Math.floor(total / 60);

    const seconds =
      total % 60;

    return (
      `${String(minutes).padStart(2, '0')}:` +
      `${String(seconds).padStart(2, '0')}`
    );

  }


  get focusProgress(): number {

    if (!this.focusDuration) {
      return 0;
    }

    return (
      (
        this.focusDuration -
        this.focusRemaining()
      ) /
      this.focusDuration
    ) * 100;

  }


  /* =====================================================
     DASHBOARD
  ===================================================== */

  totalStudyHours = 18;


  get currentDate(): string {

    return new Date().toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }
    );

  }


  get currentDay(): number {

    return new Date().getDate();

  }


  get currentMonth(): string {

    return new Date().toLocaleDateString(
      'en-US',
      {
        month: 'short'
      }
    );

  }


  get currentYear(): number {

    return new Date().getFullYear();

  }


  get formattedDate(): string {

    return new Date().toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }
    );

  }


  get formattedShortDate(): string {

    return new Date().toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric'
      }
    );

  }


  get todayDay(): number {

    return new Date().getDate();

  }


  get todayDate(): string {

    return new Date().toLocaleDateString(
      'en-US',
      {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }
    );

  }


  /* =====================================================
     LOAD EVERYTHING
  ===================================================== */

  async loadAllData(): Promise<void> {

    if (!this.getToken()) {
      return;
    }

    await Promise.all([
      this.loadCourses(),
      this.loadAssignments(),
      this.loadGoals(),
      this.loadGPA(),
      this.loadSchedule()
    ]);

    this.refreshData();

  }


  /* =====================================================
     CONSTRUCTOR
  ===================================================== */

  constructor() {

    if (this.isLoggedIn()) {
      this.loadAllData();
    }

  }


  /* =====================================================
     CLEANUP
  ===================================================== */

  ngOnDestroy(): void {

    this.pauseFocus();

  }

}
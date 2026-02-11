import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProfileDetailsComponent } from './profile-details.component';
import { UserService } from '../services/user.service';
import { MessageService } from 'primeng/api';

class MockUserService {
  updateProfile = jasmine.createSpy('updateProfile').and.returnValue(of({}));
}

class MockMessageService {
  add = jasmine.createSpy('add');
}

describe('ProfileDetailsComponent', () => {
  let fixture: ComponentFixture<ProfileDetailsComponent>;
  let component: ProfileDetailsComponent;
  let userService: MockUserService;
  let messageService: MockMessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileDetailsComponent],
      providers: [
        { provide: UserService, useClass: MockUserService },
        { provide: MessageService, useClass: MockMessageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileDetailsComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as unknown as MockUserService;
    messageService = TestBed.inject(
      MessageService,
    ) as unknown as MockMessageService;
  });

  it('prepares edited profile on visible change', () => {
    const emitSpy = spyOn(component.visibleChange, 'emit');
    component.userProfile = {
      UserID: 'u1',
      Username: 'User',
      PhoneNumber: '123',
    } as any;

    component.onVisibleChange(true);

    expect(component.editedProfile?.Username).toBe('User');
    expect(emitSpy).toHaveBeenCalledWith(true);
  });

  it('submits updates when data is valid', () => {
    const emitSpy = spyOn(component.profileUpdated, 'emit');
    component.userProfile = {
      UserID: 'u1',
      Username: 'User',
      PhoneNumber: '123',
    } as any;
    component.editedProfile = {
      UserID: 'u1',
      Username: 'User 2',
      PhoneNumber: '456',
    } as any;

    component.onSubmit();

    expect(userService.updateProfile).toHaveBeenCalledWith(
      'u1',
      jasmine.any(Object),
    );
    expect(messageService.add).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('handles update errors', () => {
    component.userProfile = {
      UserID: 'u1',
      Username: 'User',
      PhoneNumber: '123',
    } as any;
    component.editedProfile = {
      UserID: 'u1',
      Username: 'User 2',
      PhoneNumber: '456',
    } as any;
    userService.updateProfile.and.returnValue(
      throwError(() => new Error('fail')),
    );

    component.onSubmit();

    expect(messageService.add).toHaveBeenCalled();
  });
});

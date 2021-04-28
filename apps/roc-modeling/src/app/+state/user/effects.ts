import { Injectable } from '@angular/core';
import { NavigationService } from '@app/core/services';
import { NotificationService } from '@app/core/services/notification/notification.service';
import { AuthService } from '@auth0/auth0-angular';
import { environment } from '@env/environment';
import { SaveUserProfileGQL, UserByIdOrDefaultGQL, UserProfile, UserProfileInput } from '@gql';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { UseCaseError } from '@vantage-point/ddd-core';
import { forkJoin, of } from 'rxjs';
import { catchError, concatMap, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { loginErrorHappened, requestLogin, requestLogout, requestUserAfterAuthentication, saveUserProfileAfterOnBoarding, setActiveUser, setHighSchool, setRoles, setUserName, setUserType } from './actions';
import { getUserProfile } from './selectors';
import { Roles } from './state';


@Injectable()
export class UserEffects
{

  constructor
    (
      private store: Store,
      private actions$: Actions,
      private authService: AuthService,
      private saveUserProfileGQL: SaveUserProfileGQL,
      private userByIdOrDefaultGQL: UserByIdOrDefaultGQL,
      private navigationService: NavigationService,
      private notificationService: NotificationService
    )
  {
  }

  requestUserAfterAuthentication$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestUserAfterAuthentication),
      concatMap(action => of(action).pipe
        (
          withLatestFrom
            (
              this.store.pipe(select(getUserProfile))
            )
        )),
      filter(([_, userProfile]) =>
      {
        if (userProfile)
        {
          return false;
        }

        return true;
      }),
      concatMap(() => this.authService.user$),
      switchMap((auth0User) =>
      {
        const defaultUserProfile: UserProfileInput =
        {
          id: auth0User.sub,
          emailAddress: auth0User.email,
          firstName: null,
          lastName: null,
          userType: null,
          highSchoolId: null,
          hasCompletedOnboarding: false,
        };

        const authRoles: any[] = auth0User["https://returnon.college/roles"] ?? [];

        const roles: Roles =
        {
          isUser: authRoles.includes("user") ?? false,
          isManager: authRoles.includes("manager") ?? false,
          isAdmin: authRoles.includes("admin") ?? false
        };

        // console.log('RAW AUTH USER', auth0User);
        // console.log('ROLES', roles);
        // console.log('DAS DEFAULT', defaultUserProfile);

        return forkJoin
          (
            [
              this.userByIdOrDefaultGQL.fetch({ id: auth0User.sub, defaultUserProfile: defaultUserProfile }),
              of(roles)
            ]
          );
      }),
      switchMap((results) =>
      {
        const userProfileFromDataStore: UserProfile = results[0].data.userByIdOrDefault;
        const roles: Roles = results[1];

        return [
          setActiveUser({ userProfile: userProfileFromDataStore }),
          setRoles({ roles })
        ];
      }),
      catchError((errorMessage) =>
      {
        const useCaseError: UseCaseError =
        {
          message: errorMessage,
          error: null,
          errorType: 'REQUEST AUTHENTICATED USER',
          details: null
        };

        return of(loginErrorHappened({ useCaseError }));
      })
    )
  );



  setActiveUser$ = createEffect(() => this.actions$.pipe
    (
      ofType(setActiveUser),
      map((action) =>
      {
        if (action.userProfile.hasCompletedOnboarding)
        {
          this.navigationService.goToModelingPage();
        }
        else
        {
          this.navigationService.goToOnBoardingPage();
        }
      })
    ), { dispatch: false }
  );

  setUserName$ = createEffect(() => this.actions$.pipe
    (
      ofType(setUserName),
      map(() =>
      {
        this.navigationService.goToOnBoardingUserTypePage();
      })
    ), { dispatch: false }
  );

  // setUserType$ = createEffect(() => this.actions$.pipe
  //   (
  //     ofType(setUserType),
  //     map(() =>
  //     {
  //       this.navigationService.goToOnBoardingHighSchoolPage();
  //     })
  //   ), { dispatch: false }
  // );

  setUserType$ = createEffect(() => this.actions$.pipe
    (
      ofType(setUserType),
      map(() => saveUserProfileAfterOnBoarding())
    ));

  setHighSchool$ = createEffect(() => this.actions$.pipe
    (
      ofType(setHighSchool),
      map(() => saveUserProfileAfterOnBoarding())
    ));

  saveUserProfileAfterOnBoarding$ = createEffect(() => this.actions$.pipe
    (
      ofType(saveUserProfileAfterOnBoarding),
      withLatestFrom
        (
          this.store.pipe(select(getUserProfile))
        ),
      switchMap(([_action, userProfile]) =>
      {
        const userProfileInput: UserProfileInput =
        {
          id: userProfile.id,
          emailAddress: userProfile.emailAddress,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          userType: userProfile.userType,
          highSchoolId: userProfile.highSchoolId,
          hasCompletedOnboarding: true,
        };

        return this.saveUserProfileGQL
          .mutate({ userProfileInput })
          .pipe
          (
            map(apolloMutationResults =>
            {
              const userProfile: UserProfile = apolloMutationResults.data.saveUserProfile;

              return setActiveUser({ userProfile });
            })
          );
      }),
      catchError((errorMessage) =>
      {
        const useCaseError: UseCaseError =
        {
          message: errorMessage,
          error: null,
          errorType: 'SAVE USER PROFILE AFTER ON-BOARDING',
          details: null
        };

        return of(loginErrorHappened({ useCaseError }));
      })
    ));



  loginErrorHappened$ = createEffect(() => this.actions$.pipe
    (
      ofType(loginErrorHappened),
      switchMap((action) => this.notificationService.error(action.useCaseError).afterDismissed()),
      map(() => requestLogout())
    ));



  requestLogin$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestLogin),
      map(() =>
      {
        const returnUrl = `${document.location.origin}/authorized`;

        this.authService.loginWithRedirect(
          {
            redirect_uri: returnUrl,
            client_id: environment.auth.clientId,
            tenantHost: document.location.host
          });
      })
    ), { dispatch: false }
  );

  requestLogout$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestLogout),
      map(() =>
      {
        const returnUrl = `${document.location.origin}/welcome`;

        this.authService.logout(
          {
            returnTo: returnUrl,
            client_id: environment.auth.clientId
          });

        this.navigationService.goToWelcomePage();
      })
    ), { dispatch: false }
  );

}

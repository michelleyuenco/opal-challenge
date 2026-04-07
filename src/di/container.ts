import { createContainer, asFunction, asValue } from 'awilix'
import { auth, db, storage } from '@infrastructure/config/firebase.config'

// Repositories
import { OpalFirestoreRepository } from '@infrastructure/firebase/OpalFirestoreRepository'
import { MediaFirestoreRepository } from '@infrastructure/firebase/MediaFirestoreRepository'
import { UserFirestoreRepository } from '@infrastructure/firebase/UserFirestoreRepository'
import { ChallengeFirestoreRepository } from '@infrastructure/firebase/ChallengeFirestoreRepository'
import { SubmissionFirestoreRepository } from '@infrastructure/firebase/SubmissionFirestoreRepository'

// Services
import { FirebaseAuthService } from '@infrastructure/firebase/FirebaseAuthService'
import { FirebaseStorageService } from '@infrastructure/firebase/FirebaseStorageService'

// Auth use cases
import { SignInUseCase } from '@application/use-cases/auth/SignInUseCase'
import { SignInWithGoogleUseCase } from '@application/use-cases/auth/SignInWithGoogleUseCase'
import { SendPasswordResetUseCase } from '@application/use-cases/auth/SendPasswordResetUseCase'
import { SignOutUseCase } from '@application/use-cases/auth/SignOutUseCase'
import { GetCurrentUserUseCase } from '@application/use-cases/auth/GetCurrentUserUseCase'

// Opal use cases
import { CreateOpalUseCase } from '@application/use-cases/opal/CreateOpalUseCase'
import { UpdateOpalUseCase } from '@application/use-cases/opal/UpdateOpalUseCase'
import { DeleteOpalUseCase } from '@application/use-cases/opal/DeleteOpalUseCase'
import { GetOpalUseCase } from '@application/use-cases/opal/GetOpalUseCase'
import { ListOpalsUseCase } from '@application/use-cases/opal/ListOpalsUseCase'
import { GetOpalWithMediaUseCase } from '@application/use-cases/opal/GetOpalWithMediaUseCase'

// Media use cases
import { UploadMediaUseCase } from '@application/use-cases/media/UploadMediaUseCase'
import { DeleteMediaUseCase } from '@application/use-cases/media/DeleteMediaUseCase'
import { GetMediaForOpalUseCase } from '@application/use-cases/media/GetMediaForOpalUseCase'

// Challenge use cases
import { CreateChallengeUseCase } from '@application/use-cases/challenge/CreateChallengeUseCase'
import { ActivateChallengeUseCase } from '@application/use-cases/challenge/ActivateChallengeUseCase'
import { ConcludeChallengeUseCase } from '@application/use-cases/challenge/ConcludeChallengeUseCase'
import { GetActiveChallengeUseCase } from '@application/use-cases/challenge/GetActiveChallengeUseCase'
import { GetChallengeResultUseCase } from '@application/use-cases/challenge/GetChallengeResultUseCase'

// Submission use cases
import { SubmitGuessUseCase } from '@application/use-cases/submission/SubmitGuessUseCase'
import { GetMySubmissionUseCase } from '@application/use-cases/submission/GetMySubmissionUseCase'
import { ListSubmissionsUseCase } from '@application/use-cases/submission/ListSubmissionsUseCase'

// Dataset use cases
import { GetDatasetManifestUseCase } from '@application/use-cases/dataset/GetDatasetManifestUseCase'

// Poster repositories
import { PosterFirestoreRepository } from '@infrastructure/firebase/PosterFirestoreRepository'
import { PosterVersionFirestoreRepository } from '@infrastructure/firebase/PosterVersionFirestoreRepository'

// Poster use cases
import { CreatePosterUseCase } from '@application/use-cases/poster/CreatePosterUseCase'
import { GetPosterUseCase } from '@application/use-cases/poster/GetPosterUseCase'
import { ListUserPostersUseCase } from '@application/use-cases/poster/ListUserPostersUseCase'
import { ListSharedPostersUseCase } from '@application/use-cases/poster/ListSharedPostersUseCase'
import { UpdatePosterUseCase } from '@application/use-cases/poster/UpdatePosterUseCase'
import { SharePosterUseCase } from '@application/use-cases/poster/SharePosterUseCase'
import { DeletePosterUseCase } from '@application/use-cases/poster/DeletePosterUseCase'
import { UploadPosterVersionUseCase } from '@application/use-cases/poster/UploadPosterVersionUseCase'
import { GetPosterVersionTreeUseCase } from '@application/use-cases/poster/GetPosterVersionTreeUseCase'
import { DeletePosterVersionUseCase } from '@application/use-cases/poster/DeletePosterVersionUseCase'

import { TOKENS } from './tokens'

export type DIContainer = ReturnType<typeof createDIContainer>

export function createDIContainer() {
  const container = createContainer()

  // Firebase instances
  container.register({
    [TOKENS.FirebaseAuth]: asValue(auth),
    [TOKENS.Firestore]: asValue(db),
    [TOKENS.FirebaseStorage]: asValue(storage),
  })

  // Repositories
  container.register({
    [TOKENS.UserRepository]: asFunction(
      (cradle) => new UserFirestoreRepository(cradle[TOKENS.Firestore]),
    ).singleton(),
    [TOKENS.OpalRepository]: asFunction(
      (cradle) => new OpalFirestoreRepository(cradle[TOKENS.Firestore]),
    ).singleton(),
    [TOKENS.MediaRepository]: asFunction(
      (cradle) => new MediaFirestoreRepository(cradle[TOKENS.Firestore]),
    ).singleton(),
    [TOKENS.ChallengeRepository]: asFunction(
      (cradle) => new ChallengeFirestoreRepository(cradle[TOKENS.Firestore]),
    ).singleton(),
    [TOKENS.SubmissionRepository]: asFunction(
      (cradle) => new SubmissionFirestoreRepository(cradle[TOKENS.Firestore]),
    ).singleton(),
  })

  // Services
  container.register({
    [TOKENS.AuthService]: asFunction(
      (cradle) =>
        new FirebaseAuthService(
          cradle[TOKENS.FirebaseAuth],
          cradle[TOKENS.UserRepository],
        ),
    ).singleton(),
    [TOKENS.StorageService]: asFunction(
      (cradle) => new FirebaseStorageService(cradle[TOKENS.FirebaseStorage]),
    ).singleton(),
  })

  // Auth use cases
  container.register({
    [TOKENS.SignInUseCase]: asFunction(
      (cradle) => new SignInUseCase(cradle[TOKENS.AuthService]),
    ),
    [TOKENS.SignInWithGoogleUseCase]: asFunction(
      (cradle) => new SignInWithGoogleUseCase(cradle[TOKENS.AuthService]),
    ),
    [TOKENS.SendPasswordResetUseCase]: asFunction(
      (cradle) => new SendPasswordResetUseCase(cradle[TOKENS.AuthService]),
    ),
    [TOKENS.SignOutUseCase]: asFunction(
      (cradle) => new SignOutUseCase(cradle[TOKENS.AuthService]),
    ),
    [TOKENS.GetCurrentUserUseCase]: asFunction(
      (cradle) => new GetCurrentUserUseCase(cradle[TOKENS.AuthService]),
    ),
  })

  // Opal use cases
  container.register({
    [TOKENS.CreateOpalUseCase]: asFunction(
      (cradle) => new CreateOpalUseCase(cradle[TOKENS.OpalRepository]),
    ),
    [TOKENS.UpdateOpalUseCase]: asFunction(
      (cradle) => new UpdateOpalUseCase(cradle[TOKENS.OpalRepository]),
    ),
    [TOKENS.DeleteOpalUseCase]: asFunction(
      (cradle) => new DeleteOpalUseCase(cradle[TOKENS.OpalRepository]),
    ),
    [TOKENS.GetOpalUseCase]: asFunction(
      (cradle) => new GetOpalUseCase(cradle[TOKENS.OpalRepository]),
    ),
    [TOKENS.ListOpalsUseCase]: asFunction(
      (cradle) => new ListOpalsUseCase(cradle[TOKENS.OpalRepository]),
    ),
    [TOKENS.GetOpalWithMediaUseCase]: asFunction(
      (cradle) =>
        new GetOpalWithMediaUseCase(
          cradle[TOKENS.OpalRepository],
          cradle[TOKENS.MediaRepository],
          cradle[TOKENS.StorageService],
        ),
    ),
  })

  // Media use cases
  container.register({
    [TOKENS.UploadMediaUseCase]: asFunction(
      (cradle) =>
        new UploadMediaUseCase(
          cradle[TOKENS.MediaRepository],
          cradle[TOKENS.OpalRepository],
          cradle[TOKENS.StorageService],
        ),
    ),
    [TOKENS.DeleteMediaUseCase]: asFunction(
      (cradle) =>
        new DeleteMediaUseCase(
          cradle[TOKENS.MediaRepository],
          cradle[TOKENS.OpalRepository],
          cradle[TOKENS.StorageService],
        ),
    ),
    [TOKENS.GetMediaForOpalUseCase]: asFunction(
      (cradle) =>
        new GetMediaForOpalUseCase(
          cradle[TOKENS.MediaRepository],
          cradle[TOKENS.StorageService],
        ),
    ),
  })

  // Challenge use cases
  container.register({
    [TOKENS.CreateChallengeUseCase]: asFunction(
      (cradle) =>
        new CreateChallengeUseCase(cradle[TOKENS.ChallengeRepository]),
    ),
    [TOKENS.ActivateChallengeUseCase]: asFunction(
      (cradle) =>
        new ActivateChallengeUseCase(
          cradle[TOKENS.ChallengeRepository],
          cradle[TOKENS.OpalRepository],
        ),
    ),
    [TOKENS.ConcludeChallengeUseCase]: asFunction(
      (cradle) =>
        new ConcludeChallengeUseCase(
          cradle[TOKENS.ChallengeRepository],
          cradle[TOKENS.SubmissionRepository],
          cradle[TOKENS.StorageService],
        ),
    ),
    [TOKENS.GetActiveChallengeUseCase]: asFunction(
      (cradle) =>
        new GetActiveChallengeUseCase(cradle[TOKENS.ChallengeRepository]),
    ),
    [TOKENS.GetChallengeResultUseCase]: asFunction(
      (cradle) =>
        new GetChallengeResultUseCase(
          cradle[TOKENS.ChallengeRepository],
          cradle[TOKENS.StorageService],
        ),
    ),
  })

  // Submission use cases
  container.register({
    [TOKENS.SubmitGuessUseCase]: asFunction(
      (cradle) =>
        new SubmitGuessUseCase(
          cradle[TOKENS.SubmissionRepository],
          cradle[TOKENS.ChallengeRepository],
          cradle[TOKENS.OpalRepository],
        ),
    ),
    [TOKENS.GetMySubmissionUseCase]: asFunction(
      (cradle) =>
        new GetMySubmissionUseCase(cradle[TOKENS.SubmissionRepository]),
    ),
    [TOKENS.ListSubmissionsUseCase]: asFunction(
      (cradle) =>
        new ListSubmissionsUseCase(cradle[TOKENS.SubmissionRepository]),
    ),
  })

  // Dataset use cases
  container.register({
    [TOKENS.GetDatasetManifestUseCase]: asFunction(
      (cradle) =>
        new GetDatasetManifestUseCase(
          cradle[TOKENS.OpalRepository],
          cradle[TOKENS.MediaRepository],
          cradle[TOKENS.StorageService],
        ),
    ),
  })

  // Poster repositories
  container.register({
    [TOKENS.PosterRepository]: asFunction(
      (cradle) => new PosterFirestoreRepository(cradle[TOKENS.Firestore]),
    ).singleton(),
    [TOKENS.PosterVersionRepository]: asFunction(
      (cradle) => new PosterVersionFirestoreRepository(cradle[TOKENS.Firestore]),
    ).singleton(),
  })

  // Poster use cases
  container.register({
    [TOKENS.CreatePosterUseCase]: asFunction(
      (cradle) => new CreatePosterUseCase(cradle[TOKENS.PosterRepository]),
    ),
    [TOKENS.GetPosterUseCase]: asFunction(
      (cradle) => new GetPosterUseCase(cradle[TOKENS.PosterRepository]),
    ),
    [TOKENS.ListUserPostersUseCase]: asFunction(
      (cradle) =>
        new ListUserPostersUseCase(
          cradle[TOKENS.PosterRepository],
          cradle[TOKENS.PosterVersionRepository],
          cradle[TOKENS.StorageService],
        ),
    ),
    [TOKENS.ListSharedPostersUseCase]: asFunction(
      (cradle) =>
        new ListSharedPostersUseCase(
          cradle[TOKENS.PosterRepository],
          cradle[TOKENS.PosterVersionRepository],
          cradle[TOKENS.StorageService],
        ),
    ),
    [TOKENS.UpdatePosterUseCase]: asFunction(
      (cradle) => new UpdatePosterUseCase(cradle[TOKENS.PosterRepository]),
    ),
    [TOKENS.SharePosterUseCase]: asFunction(
      (cradle) => new SharePosterUseCase(cradle[TOKENS.PosterRepository]),
    ),
    [TOKENS.DeletePosterUseCase]: asFunction(
      (cradle) =>
        new DeletePosterUseCase(
          cradle[TOKENS.PosterRepository],
          cradle[TOKENS.PosterVersionRepository],
          cradle[TOKENS.StorageService],
        ),
    ),
    [TOKENS.UploadPosterVersionUseCase]: asFunction(
      (cradle) =>
        new UploadPosterVersionUseCase(
          cradle[TOKENS.PosterVersionRepository],
          cradle[TOKENS.PosterRepository],
          cradle[TOKENS.StorageService],
        ),
    ),
    [TOKENS.GetPosterVersionTreeUseCase]: asFunction(
      (cradle) =>
        new GetPosterVersionTreeUseCase(
          cradle[TOKENS.PosterVersionRepository],
          cradle[TOKENS.StorageService],
        ),
    ),
    [TOKENS.DeletePosterVersionUseCase]: asFunction(
      (cradle) =>
        new DeletePosterVersionUseCase(
          cradle[TOKENS.PosterVersionRepository],
          cradle[TOKENS.StorageService],
        ),
    ),
  })

  return container
}

export const TOKENS = {
  // Firebase instances
  FirebaseAuth: 'FirebaseAuth',
  Firestore: 'Firestore',
  FirebaseStorage: 'FirebaseStorage',

  // Services
  AuthService: 'AuthService',
  StorageService: 'StorageService',

  // Repositories
  OpalRepository: 'OpalRepository',
  MediaRepository: 'MediaRepository',
  UserRepository: 'UserRepository',
  ChallengeRepository: 'ChallengeRepository',
  SubmissionRepository: 'SubmissionRepository',

  // Auth use cases
  SignInUseCase: 'SignInUseCase',
  SignInWithGoogleUseCase: 'SignInWithGoogleUseCase',
  SendPasswordResetUseCase: 'SendPasswordResetUseCase',
  SignOutUseCase: 'SignOutUseCase',
  GetCurrentUserUseCase: 'GetCurrentUserUseCase',

  // Opal use cases
  CreateOpalUseCase: 'CreateOpalUseCase',
  UpdateOpalUseCase: 'UpdateOpalUseCase',
  DeleteOpalUseCase: 'DeleteOpalUseCase',
  GetOpalUseCase: 'GetOpalUseCase',
  ListOpalsUseCase: 'ListOpalsUseCase',
  GetOpalWithMediaUseCase: 'GetOpalWithMediaUseCase',

  // Media use cases
  UploadMediaUseCase: 'UploadMediaUseCase',
  DeleteMediaUseCase: 'DeleteMediaUseCase',
  GetMediaForOpalUseCase: 'GetMediaForOpalUseCase',

  // Challenge use cases
  CreateChallengeUseCase: 'CreateChallengeUseCase',
  ActivateChallengeUseCase: 'ActivateChallengeUseCase',
  ConcludeChallengeUseCase: 'ConcludeChallengeUseCase',
  GetActiveChallengeUseCase: 'GetActiveChallengeUseCase',
  GetChallengeResultUseCase: 'GetChallengeResultUseCase',

  // Submission use cases
  SubmitGuessUseCase: 'SubmitGuessUseCase',
  GetMySubmissionUseCase: 'GetMySubmissionUseCase',
  ListSubmissionsUseCase: 'ListSubmissionsUseCase',

  // Dataset use cases
  GetDatasetManifestUseCase: 'GetDatasetManifestUseCase',

  // Poster repositories
  PosterRepository: 'PosterRepository',
  PosterVersionRepository: 'PosterVersionRepository',

  // Poster use cases
  CreatePosterUseCase: 'CreatePosterUseCase',
  GetPosterUseCase: 'GetPosterUseCase',
  ListUserPostersUseCase: 'ListUserPostersUseCase',
  ListSharedPostersUseCase: 'ListSharedPostersUseCase',
  UpdatePosterUseCase: 'UpdatePosterUseCase',
  SharePosterUseCase: 'SharePosterUseCase',
  DeletePosterUseCase: 'DeletePosterUseCase',
  UploadPosterVersionUseCase: 'UploadPosterVersionUseCase',
  GetPosterVersionTreeUseCase: 'GetPosterVersionTreeUseCase',
  DeletePosterVersionUseCase: 'DeletePosterVersionUseCase',
} as const

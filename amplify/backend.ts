import { defineBackend } from '@aws-amplify/backend';

import { storage } from './storage/resource';
import { firstBucket } from './storage/resource';
import { secondBucket } from './storage/resource';
/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
defineBackend({

  storage,
  firstBucket,
  secondBucket,
});

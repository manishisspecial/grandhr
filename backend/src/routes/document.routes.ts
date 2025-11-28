import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getMyDocuments,
  deleteDocument,
} from '../controllers/document.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, uploadDocument);
router.get('/', authenticate, authorize('ADMIN', 'HR'), getDocuments);
router.get('/my-documents', authenticate, getMyDocuments);
router.delete('/:id', authenticate, deleteDocument);

export default router;


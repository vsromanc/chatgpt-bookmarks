import { ContentController } from './content-controller';

const controller = new ContentController();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => controller.initialize());
} else {
  controller.initialize();
}
import { initModel } from './model';
import { initView} from './view';
import { initController, animate } from './controller';

document.addEventListener('DOMContentLoaded', () => {
    const model =  initModel();
    const view = initView();
    const controller = initController(model, view);

    animate;
});

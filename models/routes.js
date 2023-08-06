import { Router } from "express";
import controller from '../controller/controller.js';
import bodyParser from 'body-parser';

import multer from 'multer';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // The folder where uploaded images will be stored
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

const router = Router();

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

router.get(`/`, controller.getIndex);
router.get(`/home`, controller.getHome);
router.get(`/viewprofile`, controller.viewProfile);
router.get(`/editUser`, controller.editUser);
router.post(`/editUserDetails`, upload.single('profilePicture'), controller.editUserDetails);

router.get(`/login`, controller.getLogin);
router.get(`/register`, controller.getRegister);
router.post(`/loginUser`, controller.loginUser);
router.post(`/registerUser`, controller.registerUser);
router.get(`/logout`, controller.logoutUser);

router.get(`/review`, controller.getCreateReview);
router.post(`/createPost`, upload.array('attached', 10), controller.createPost);
router.get(`/editPost`, controller.getEditPost);
router.post(`/confirmEditPost`, upload.array('attached', 10), controller.editPost);

router.post(`/comment`, controller.addComment);
router.get(`/updateHelpful`, controller.updateHelpful);
router.get(`/updateNotHelpful`, controller.updateNotHelpful);

router.get(`/estabPage`, controller.getEstablishments);
router.get(`/estAteRicas`, controller.getEstAteRicas);
router.get(`/estGoodMunch`, controller.getEstGoodMunch);
router.get(`/estHappyNHealthy`, controller.getEstHappyNHealthy);
router.get(`/estKuyaMels`, controller.getEstKuyaMels);
router.get(`/estPotatoGiant`, controller.getEstPotatoGiant);

router.get(`/search`, controller.getSearchResults);


// router.get(`/about`, controller.getAbout);

// router.get(`/cafe`, controller.getCafes);
// router.get(`/cafe/:cafeName`, controller.cafe);
// router.get(`/login`, controller.login);
// router.post(`/login_success`, controller.logsucc);
// router.get(`/logout`, controller.logout);

// router.post(`/register_process`, controller.register_process);
// router.get(`/register`, controller.register);

// router.get(`/myprofile`, controller.profile);
// router.get(`/settings`, controller.settings);
// router.post(`/cafe`, controller.searchcafes)
// //edit
// router.get(`/review`, controller.refreshCafe);

// router.post('/addReview', controller.addReview);

// router.delete('/deleteReview', controller.deleteReview);

// router.put('/editReview', controller.editReview);

export default router;
import { Router } from "restify-router";
import auth from "../controller/auth";

const Default = new Router()

Default.get('', auth.getAuth)
Default.post('', auth.login)

export default Default
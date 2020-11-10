const bcrypt = require('bcrypt')

module.exports = {
    register: async (req, res) => {
        const db = req.app.get('db')
        const { email, username, password } = req.body
        const user = await db.check_user(email, username, password)

        if (user[0]) {
            return res.status(409).send("User already exists")
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt)
        const [newUser] = await db.add_user([username, email, hash])

        req.session.user = {
            userId: newUser.user_id,
            email: newUser.email,
            username: newUser.username
        }

        res.status(200).send(req.session.user)
    },
    login: async (req, res) => {
        const db = req.app.get('db')
        const {email, password} = req.body
        const [user] = await db.check_user(email)
        if (!user) {
            return res.status(409).send("Incorrect credentials")
        }

        const authenticated = bcrypt.compareSync(password, user.password)

        if (authenticated) {
            const {user_id, email, username} = user
            req.session.user = {
                userId: user_id,
                email: email,
                username: username
            }
            res.status(200).send(req.session.user)
        } else {
            res.status(401).send("Incorrect credentials")
        }
    },
    logout: (req, res) => {
        req.session.destroy()
        res.sendStatus(200)
    },
    getUser: (req, res) => {
        req.session.user ? res.status(200).send(req.session.userId)
        : res.sendStatus(404)
    }
}
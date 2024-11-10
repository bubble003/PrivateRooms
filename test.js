

const app = express();

app.use(express.json());

app.get('/', userRoutes);
app.get('/hello', chatRoutes);


app.get('/login', authMiddleware, async (req,res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email: email})

    if(!user)               throw new Error("INvalid user");
    
    const validPassword = brcypt.compare(password,user.password);

    if(user && validPassword){
        res.json({
            id: user.id,
            email: user.email,
        })
    }

    else{
        res.status(401);

    }
})

const genrateToken = (id) => {
    return jwt.sign({id} , TOKEN, {
        expiresIn: '30d',
    })
}


app.post('/register', authMiddleware, async(req,res) => {
    const {name,email,password} = req.body;

    if(!name || !email || !password){

    }

    const userExists = await User.findOne({email})

    if(userExists){
        res.status(400);

    }

    const user = await User.create({
        name,
        email,
        password,
        pic
    })

    if(user){
        res.status(201).json({
            name: user.name,
            email: user.email
        }
        )
    }
})


app.post("/dad", async(req,res) => {
    const test = await Chat.find({
        A: false,
        $and: [
            {
                users: {$elemMatch : {user}}
            },
            {
                acc: {$elemMatch: {user}}
            }
        ]
    })

    const test2 = await Chat.findByIdandUpadate({id : id}, {
        $push: { users: userid}}, {new: true}
    )
})
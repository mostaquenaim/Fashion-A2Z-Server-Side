const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
const corsConfig = {
origin: '*',
credentials: true,
methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}
app.use(cors(corsConfig))
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4epqqc2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const productCollection = client.db('productDB').collection('product');
        const cartCollection = client.db('productDB').collection('cart');

        // insert new product 
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct)
            const result = await productCollection.insertOne(newProduct)
            res.send(result)
        })


        // get all products 
        app.get('/product', async (req, res) => {
            const cursor = productCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        // insert new product in cart
        app.post('/add-to-cart', async (req, res) => {
            const newCart = req.body;
            console.log(newCart)
            const result = await cartCollection.insertOne(newCart)
            res.send(result)
        })

        // get product by id 
        app.get('/productById/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query);
            res.send(result);
        })

         //get cart by email
         app.get('/cartById/:email', async (req, res) => {
            const email = req.params.email;
            const query = { user: email }; 
            const cursor = cartCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // get product by brand id
        app.get('/productsByBrand/:brand', async (req, res) => {
            const brand = req.params.brand;
            const query = { brand: brand };
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });


        //delete cart
        app.delete('/delete-cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        })

        
        //update product
        app.put('/update-product/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedProduct = req.body;

            const product = {

                $set: {
                    name: updatedProduct.name,
                    brand: updatedProduct.brand,
                    type: updatedProduct.type,
                    price: updatedProduct.price,
                    description: updatedProduct.description,
                    rating: updatedProduct.rating,
                    image: updatedProduct.image
                }

            }

            const result = await productCollection.updateOne(filter, product, options);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Fashion A2Z server is running')
})

app.listen((port), () => {
    console.log(`Fashion A2Z server is running : ${port}`)
})

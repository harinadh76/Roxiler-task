const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();
const port = 5000;

app.use(express.json());


mongoose.connect('mongodb+srv://levinholevi4139:dinothunder@nodetask.z0rmy4r.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
    })
    .catch((error) => {
    console.error(error);
    });


const productSchema = new mongoose.Schema({
  id: String,
  title: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  sold: Boolean,
  dateOfSale: Date,
});
const Product = mongoose.model('Product', productSchema);





app.get("/", (req, res) => {
    res.send("Hello World!");
    });






app.get('/database', async (req, res) => {
  try {
    
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = response.data;

   
    await Product.insertMany(data);

    res.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});






app.get('/sales', async (req, res) => {
    try {

    //  const selectedMonth = parseInt(req.body.month);
    const Month = parseInt(req.query.month);
  
      const startDate = new Date(2021, Month - 1, 1);
      const endDate = new Date(2022, Month, 0, 23, 59, 59, 999);
        

        console.log(startDate);
        console.log(endDate);


      const totalSaleAmount = await Product.aggregate([
        {
          $match: {
            dateOfSale: {
              $gte: startDate,
              $lte: endDate,
            },
            sold: true,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$price' },
          },
        },
      ]);
  
      const totalSoldItems = await Product.countDocuments({
        dateOfSale: {
          $gte: startDate,
          $lte: endDate,
        },
        sold: true,
      });
  
      
      const totalNotSoldItems = await Product.countDocuments({
        dateOfSale: {
          $gte: startDate,
          $lte: endDate,
        },
        sold: false,
      });
  
      res.json({
        totalSaleAmount: totalSaleAmount[0]?.total || 0,
        totalSoldItems,
        totalNotSoldItems,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });







  
app.get('/barChart', async (req, res) => {
    try {
      const Month = parseInt(req.query.month);
  
      
      const startDate = new Date(2021, Month - 1, 1);
      const endDate = new Date(2022, Month, 0, 23, 59, 59, 999);
  
    
      const priceRanges = [
        { min: 0, max: 100 },
        { min: 101, max: 200 },
        { min: 201, max: 300 },
        { min: 301, max: 400 },
        { min: 401, max: 500 },
        { min: 501, max: 600 },
        { min: 601, max: 700 },
        { min: 701, max: 800 },
        { min: 801, max: 900 },
        { min: 901, max: Infinity },
      ];
  
      
      const barChartData = await Promise.all(
        priceRanges.map(async (range) => {
          const count = await Product.countDocuments({
            dateOfSale: {
              $gte: startDate,
              $lte: endDate,
            },
            price: {
              $gte: range.min,
              $lte: range.max,
            },
          });
  
          return {
            priceRange: `${range.min}-${range.max}`,
            count,
          };
        })
      );
  
      res.json(barChartData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  





  app.get('/pieChart', async (req, res) => {
    try {
      const Month = parseInt(req.query.month);
  
      
      const startDate = new Date(2021, Month - 1, 1);
      const endDate = new Date(2022, Month, 0, 23, 59, 59, 999);
  
      const categoryData = await Product.aggregate([
        {
          $match: {
            dateOfSale: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            count: 1,
          },
        },
      ]);
  
      res.json(categoryData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  



  

  app.get('/totalData', async (req, res) => {
    try {
      const selectedMonth = parseInt(req.query.month);

      const salesResponse = await axios.get(`http://localhost:${port}/sales?month=${selectedMonth}`);
        const salesData = salesResponse.data;
  
      
      const barChartResponse = await axios.get(`http://localhost:${port}/barChart?month=${selectedMonth}`);
      const barChartData = barChartResponse.data;
  
     
      const pieChartResponse = await axios.get(`http://localhost:${port}/pieChart?month=${selectedMonth}`);
      const pieChartData = pieChartResponse.data;
  
      
      const combinedData = {
        sales: salesData,
        barChart: barChartData,
        pieChart: pieChartData,
      };
  
      res.json(combinedData);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  















app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

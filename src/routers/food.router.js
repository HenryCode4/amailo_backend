import { Router } from "express";
import handler from 'express-async-handler'
import {FoodModel} from "../models/food.model.js";
import { sample_tags } from "../data.js";
import admin from '../middleware/admin.mid.js';






const router = Router();

router.get("/", handler( async (req, res) => {
    const foods = await FoodModel.find({});
    res.send(foods);
  }));

// router.get("/tags", handler( async (req, res) => {
//     const tags = await FoodModel.aggregate([
//         {
//             $unwind: '$tags',
//         },
//         {
//             $group: {
//                 _id: '$tags',
//                 count: {$sum: 1},
//             },
//         },
//         {
//             $project: {
//                 _id: 0,
//                 name: '$_id',
//                 count: '$count',
//             }
//         }
//     ]).sort({count: -1});

//     const all = {
//         name: 'All', 
//         count: await FoodModel.countDocuments(),
//     };

//     tags.unshift(all);


//     res.send(tags);
//   }));

// router.get("/tags", handler(async (req, res) => {
//     const tags = await FoodModel.aggregate([
//         {
//             $unwind: '$tags',
//         },
//         {
//             $group: {
//                 _id: '$tags',
//                 count: { $sum: 1 },
//             },
//         },
//         {
//             $project: {
//                 _id: 0,
//                 name: '$_id',
//                 count: '$count',
//             }
//         }
//     ]).sort({ count: -1 });

//     const all = {
//         name: 'All',
//         count: await FoodModel.countDocuments(),
//     };

//     tags.unshift(all);

//     // Mapping tags to include imageUrlTags
//     const tagsWithImages = tags.map(tag => {
//         const sampleTag = sample_tags.find(sampleTag => sampleTag.name === tag.name);
//         if (sampleTag) {
//             return {
//                 ...tag,
//                 imageUrl: sampleTag.imageUrlTags, // Use imageUrlTags from sample_tags
//             };
//         } else {
//             return tag;
//         }
//     });

//     res.send(tagsWithImages);
// }));

router.get("/tags", handler(async (req, res) => {
  // Retrieve tags from the database
  const tagsFromDB = await FoodModel.aggregate([
      {
          $unwind: '$tags',
      },
      {
          $group: {
              _id: '$tags',
              count: { $sum: 1 },
          },
      },
      {
          $project: {
              _id: 0,
              name: '$_id',
              count: '$count',
          }
      }
  ]).sort({ count: -1 });

  // Create an array to store final tags data
  const tagsWithImages = [];

  // Iterate through tags from the database and add imageTags if available
  for (const tag of tagsFromDB) {
      const dbTag = await FoodModel.findOne({ tags: tag.name }, { imageTags: 1 }).lean();
      tagsWithImages.push({
          ...tag,
          imageTags: dbTag ? dbTag.imageTags : null, // Use imageTags from the database if available
      });
  }

  // Sort tags by count in descending order
  tagsWithImages.sort((a, b) => b.count - a.count);

  // Add 'All' tag with total count
  const all = {
      name: 'All',
      count: await FoodModel.countDocuments(),
      imageTags: '/icons/all.jpg', // Assuming there is an icon for 'All'
  };
  tagsWithImages.unshift(all);

  res.send(tagsWithImages);
}));



router.get("/search/:searchTerm", handler( async (req, res) => {
    const { searchTerm } = req.params;
    const searchRegex = new RegExp(searchTerm, 'i')

    const foods = await FoodModel.find({name: {$regex: searchRegex}})
    res.send(foods);
  }));


router.get('/tag/:tag', handler( async (req, res)=>{
    const {tag} = req.params;
    const foods = await FoodModel.find({tags: tag});
    res.send(foods)
}));



router.get('/:foodId', handler( async (req, res)=> {
    const {foodId} = req.params;

    const food = await FoodModel.findById(foodId)
    res.send(food);
}));


router.post(
    '/',
    admin,
    handler(async (req, res) => {
      const { name, price, tags, favorite, imageUrl, imageTag, origins, cookTime } =
        req.body;
  
      const food = new FoodModel({
        name,
        price,
        tags: tags.split ? tags.split(',') : tags,
        favorite,
        imageUrl,
        imageTag,
        origins: origins.split ? origins.split(',') : origins,
        cookTime,
      });
  
      await food.save();
  
      res.send(food);
    })
  );
  
  router.put(
    '/',
    admin,
    handler(async (req, res) => {
      const { id, name, price, tags, favorite, imageUrl, imageTag, origins, cookTime } =
        req.body;
  
      await FoodModel.updateOne(
        { _id: id },
        {
          name,
          price,
          tags: tags.split ? tags.split(',') : tags,
          favorite,
          imageUrl,
          imageTag,
          origins: origins.split ? origins.split(',') : origins,
          cookTime,
        }
      );
  
      res.send();
    })
  );
  
  router.delete(
    '/:foodId',
    admin,
    handler(async (req, res) => {
      const { foodId } = req.params;
      await FoodModel.deleteOne({ _id: foodId });
      res.send();
    })
  );
  


export default router;

// import { model, Schema } from 'mongoose';

// export const FoodSchema = new Schema(
//   {
//     name: { type: String, required: true },
//     price: { type: Number, required: true },
//     tags: { type: [String] },
//     favorite: { type: Boolean, default: false },
//     stars: { type: Number, default: 3 },
//     imageUrl: { type: String, required: true },
//     origins: { type: [String], required: true },
//     cookTime: { type: String, required: true },
//   },
//   {
//     toJSON: {
//       virtuals: true,
//     },
//     toObject: {
//       virtuals: true,
//     },
//     timestamps: true,
//   }
// );

// export const FoodModel = model('food', FoodSchema);


import { model, Schema } from 'mongoose';

const TagSchema = new Schema({
    name: { type: String, required: true },
    imageUrlTags: { type: String, required: true }
});

export const FoodSchema = new Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        tags: { type: [TagSchema], required: true },
        favorite: { type: Boolean, default: false },
        stars: { type: Number, default: 3 },
        imageUrl: { type: String, required: true },
        origins: { type: [String], required: true },
        cookTime: { type: String, required: true },
    },
    {
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
        timestamps: true,
    }
);

export const FoodModel = model('food', FoodSchema);


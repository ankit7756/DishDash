import { RestaurantModel } from "../models/Restaurant.model";
import { FoodModel } from "../models/Food.model";
import { connectDB } from "../database/mongodb";

const seedData = async () => {
    try {
        await connectDB();

        await RestaurantModel.deleteMany({});
        await FoodModel.deleteMany({});

        const restaurants = await RestaurantModel.insertMany([
            {
                name: "Pizza Hut",
                image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
                description: "America's favorite pizza delivery chain with a variety of pizzas, pastas, and sides.",
                rating: 4.5,
                deliveryTime: "30-40 mins",
                deliveryFee: 50,
                categories: ["Pizza", "Italian", "Fast Food"],
                address: "Kathmandu, Nepal",
                phone: "01-4567890",
                isOpen: true,
            },
            {
                name: "KFC",
                image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500",
                description: "World-famous fried chicken, burgers, and sides.",
                rating: 4.3,
                deliveryTime: "25-35 mins",
                deliveryFee: 40,
                categories: ["Chicken", "Fast Food", "American"],
                address: "Lalitpur, Nepal",
                phone: "01-4567891",
                isOpen: true,
            },
            {
                name: "Burger King",
                image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500",
                description: "Flame-grilled burgers, crispy fries, and refreshing beverages.",
                rating: 4.4,
                deliveryTime: "20-30 mins",
                deliveryFee: 45,
                categories: ["Burgers", "Fast Food", "American"],
                address: "Bhaktapur, Nepal",
                phone: "01-4567892",
                isOpen: true,
            },
            {
                name: "Noodles & Company",
                image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500",
                description: "Fresh noodles, authentic Asian flavors, and vegetarian options.",
                rating: 4.6,
                deliveryTime: "35-45 mins",
                deliveryFee: 60,
                categories: ["Noodles", "Asian", "Chinese"],
                address: "Patan, Nepal",
                phone: "01-4567893",
                isOpen: true,
            },
            {
                name: "Cafe Delight",
                image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500",
                description: "Cozy cafe serving coffee, pastries, sandwiches, and desserts.",
                rating: 4.7,
                deliveryTime: "15-25 mins",
                deliveryFee: 30,
                categories: ["Cafe", "Desserts", "Coffee"],
                address: "Thamel, Kathmandu",
                phone: "01-4567894",
                isOpen: true,
            },
            {
                name: "Momo Palace",
                image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500",
                description: "Nepal's finest momos — steamed, fried, and jhol momos made fresh daily.",
                rating: 4.8,
                deliveryTime: "20-30 mins",
                deliveryFee: 35,
                categories: ["Momo", "Nepali", "Snacks"],
                address: "Thamel, Kathmandu",
                phone: "01-4567895",
                isOpen: true,
            },
            {
                name: "Sushi World",
                image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500",
                description: "Authentic Japanese sushi, ramen, and bento boxes prepared by expert chefs.",
                rating: 4.6,
                deliveryTime: "40-50 mins",
                deliveryFee: 80,
                categories: ["Sushi", "Japanese", "Asian"],
                address: "Lazimpat, Kathmandu",
                phone: "01-4567896",
                isOpen: true,
            },
            {
                name: "The Grill House",
                image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500",
                description: "Premium grilled steaks, BBQ ribs, and smoked meats for the ultimate carnivore experience.",
                rating: 4.5,
                deliveryTime: "35-45 mins",
                deliveryFee: 70,
                categories: ["Grill", "BBQ", "Steak"],
                address: "Jhamsikhel, Lalitpur",
                phone: "01-4567897",
                isOpen: true,
            },
            {
                name: "Kimchi House",
                image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=500",
                description: "Authentic Korean flavors — bibimbap, tteokbokki, Korean fried chicken, and sizzling BBQ right at your table.",
                rating: 4.7,
                deliveryTime: "30-40 mins",
                deliveryFee: 65,
                categories: ["Korean", "Asian", "BBQ"],
                address: "Jhamsikhel, Lalitpur",
                phone: "01-4567898",
                isOpen: true,
            },
        ]);

        console.log("✅ Restaurants created:", restaurants.length);

        const foods = [];

        // Pizza Hut Foods
        foods.push(
            {
                restaurantId: restaurants[0]._id,
                name: "Margherita Pizza",
                image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500",
                description: "Classic pizza with tomato sauce, mozzarella, and fresh basil.",
                price: 600,
                category: "Pizza",
                rating: 4.6,
                isPopular: true,
            },
            {
                restaurantId: restaurants[0]._id,
                name: "Pepperoni Pizza",
                image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500",
                description: "Loaded with pepperoni slices and mozzarella cheese.",
                price: 750,
                category: "Pizza",
                rating: 4.7,
                isPopular: true,
            },
            {
                restaurantId: restaurants[0]._id,
                name: "Veggie Supreme",
                image: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=500",
                description: "Fresh vegetables with olive oil and herbs.",
                price: 650,
                category: "Pizza",
                rating: 4.4,
                isPopular: false,
            },
            {
                restaurantId: restaurants[0]._id,
                name: "BBQ Chicken Pizza",
                image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500",
                description: "Smoky BBQ sauce with grilled chicken and red onions.",
                price: 800,
                category: "Pizza",
                rating: 4.8,
                isPopular: true,
            }
        );

        // KFC Foods
        foods.push(
            {
                restaurantId: restaurants[1]._id,
                name: "Fried Chicken Bucket",
                image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500",
                description: "Crispy fried chicken pieces with signature spices.",
                price: 850,
                category: "Chicken",
                rating: 4.5,
                isPopular: true,
            },
            {
                restaurantId: restaurants[1]._id,
                name: "Zinger Burger",
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
                description: "Spicy chicken fillet in a toasted bun.",
                price: 450,
                category: "Burger",
                rating: 4.6,
                isPopular: true,
            },
            {
                restaurantId: restaurants[1]._id,
                name: "Chicken Popcorn",
                image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500",
                description: "Bite-sized crispy chicken pieces.",
                price: 350,
                category: "Chicken",
                rating: 4.3,
                isPopular: false,
            },
            {
                restaurantId: restaurants[1]._id,
                name: "Family Feast Combo",
                image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500",
                description: "8 pieces chicken, 4 burgers, 4 fries and 4 drinks.",
                price: 2200,
                category: "Combo",
                rating: 4.7,
                isPopular: true,
            }
        );

        // Burger King Foods
        foods.push(
            {
                restaurantId: restaurants[2]._id,
                name: "Whopper",
                image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500",
                description: "Flame-grilled chicken patty with fresh vegetables and special sauce.",
                price: 550,
                category: "Burger",
                rating: 4.7,
                isPopular: true,
            },
            {
                restaurantId: restaurants[2]._id,
                name: "Chicken Royale",
                image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500",
                description: "Crispy chicken fillet with mayo and lettuce.",
                price: 500,
                category: "Burger",
                rating: 4.5,
                isPopular: false,
            },
            {
                restaurantId: restaurants[2]._id,
                name: "French Fries",
                image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500",
                description: "Golden crispy fries with a pinch of salt.",
                price: 150,
                category: "Sides",
                rating: 4.4,
                isPopular: false,
            },
            {
                restaurantId: restaurants[2]._id,
                name: "Double Chicken Combo",
                image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500",
                description: "Double chicken patty burger with large fries and drink.",
                price: 950,
                category: "Combo",
                rating: 4.8,
                isPopular: true,
            }
        );

        // Noodles & Company Foods
        foods.push(
            {
                restaurantId: restaurants[3]._id,
                name: "Chow Mein",
                image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500",
                description: "Stir-fried noodles with vegetables and soy sauce.",
                price: 400,
                category: "Noodles",
                rating: 4.6,
                isPopular: true,
            },
            {
                restaurantId: restaurants[3]._id,
                name: "Pad Thai",
                image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500",
                description: "Thai-style rice noodles with peanuts and lime.",
                price: 450,
                category: "Noodles",
                rating: 4.7,
                isPopular: true,
            },
            {
                restaurantId: restaurants[3]._id,
                name: "Spring Rolls",
                image: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=500",
                description: "Crispy vegetable rolls with sweet chili sauce.",
                price: 250,
                category: "Appetizer",
                rating: 4.5,
                isPopular: false,
            },
            {
                restaurantId: restaurants[3]._id,
                name: "Ramen Bowl",
                image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500",
                description: "Rich broth ramen with soft boiled egg and chashu pork.",
                price: 550,
                category: "Noodles",
                rating: 4.8,
                isPopular: true,
            }
        );

        // Cafe Delight Foods
        foods.push(
            {
                restaurantId: restaurants[4]._id,
                name: "Cappuccino",
                image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500",
                description: "Rich espresso with steamed milk and foam.",
                price: 200,
                category: "Coffee",
                rating: 4.8,
                isPopular: true,
            },
            {
                restaurantId: restaurants[4]._id,
                name: "Chocolate Cake",
                image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500",
                description: "Moist chocolate cake with chocolate ganache.",
                price: 350,
                category: "Dessert",
                rating: 4.9,
                isPopular: true,
            },
            {
                restaurantId: restaurants[4]._id,
                name: "Club Sandwich",
                image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500",
                description: "Triple-decker sandwich with chicken and veggies.",
                price: 400,
                category: "Sandwich",
                rating: 4.6,
                isPopular: false,
            },
            {
                restaurantId: restaurants[4]._id,
                name: "Strawberry Waffle",
                image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500",
                description: "Crispy waffle topped with fresh strawberries and whipped cream.",
                price: 380,
                category: "Dessert",
                rating: 4.7,
                isPopular: true,
            }
        );

        // Momo Palace Foods
        foods.push(
            {
                restaurantId: restaurants[5]._id,
                name: "Steamed Chicken Momo",
                image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500",
                description: "Juicy chicken momos steamed to perfection with achar.",
                price: 180,
                category: "Momo",
                rating: 4.9,
                isPopular: true,
            },
            {
                restaurantId: restaurants[5]._id,
                name: "Fried Momo",
                image: "https://images.unsplash.com/photo-1638502521795-89107ac5e246?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZHVtcGxpbmdzfGVufDB8fDB8fHww",
                description: "Crispy fried momos with tangy tomato achar.",
                price: 200,
                category: "Momo",
                rating: 4.7,
                isPopular: true,
            },
            {
                restaurantId: restaurants[5]._id,
                name: "Buff Momo",
                image: "https://images.unsplash.com/photo-1638502338747-f7f368214cce?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGR1bXBsaW5nc3xlbnwwfHwwfHx8MA%3D%3D",
                description: "Traditional buff filled momos, a Nepali classic.",
                price: 160,
                category: "Momo",
                rating: 4.6,
                isPopular: false,
            }
        );

        // Sushi World Foods — Dragon Roll removed, replaced with Tuna Roll
        foods.push(
            {
                restaurantId: restaurants[6]._id,
                name: "Salmon Sushi Roll",
                image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500",
                description: "Fresh salmon with avocado and cucumber in sushi rice.",
                price: 650,
                category: "Sushi",
                rating: 4.8,
                isPopular: true,
            },
            {
                restaurantId: restaurants[6]._id,
                name: "Chicken Ramen",
                image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500",
                description: "Classic Japanese ramen with chicken broth and soft egg.",
                price: 580,
                category: "Ramen",
                rating: 4.7,
                isPopular: true,
            },
            {
                restaurantId: restaurants[6]._id,
                name: "Tuna Sushi Roll",
                image: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=500",
                description: "Fresh tuna with cucumber and sesame seeds in sushi rice.",
                price: 700,
                category: "Sushi",
                rating: 4.8,
                isPopular: true,
            }
        );

        foods.push(
            {
                restaurantId: restaurants[7]._id,
                name: "BBQ Chicken Ribs",
                image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500",
                description: "Slow-smoked chicken ribs with signature BBQ glaze.",
                price: 1200,
                category: "BBQ",
                rating: 4.8,
                isPopular: true,
            },
            {
                restaurantId: restaurants[7]._id,
                name: "Grilled Chicken Steak",
                image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=500",
                description: "Juicy grilled chicken with garlic butter and herbs.",
                price: 850,
                category: "Grill",
                rating: 4.6,
                isPopular: true,
            },
            {
                restaurantId: restaurants[7]._id,
                name: "Mixed Grill Platter",
                image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500",
                description: "A mix of grilled chicken, lamb, and fish with sides.",
                price: 1800,
                category: "Grill",
                rating: 4.9,
                isPopular: true,
            }
        );

        // Kimchi House Foods
        foods.push(
            {
                restaurantId: restaurants[8]._id,
                name: "Bibimbap",
                image: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=500",
                description: "Korean mixed rice bowl with vegetables, egg, and gochujang sauce.",
                price: 550,
                category: "Korean",
                rating: 4.8,
                isPopular: true,
            },
            {
                restaurantId: restaurants[8]._id,
                name: "Tteokbokki",
                image: "https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=500",
                description: "Chewy rice cakes in spicy gochujang sauce with fish cakes.",
                price: 380,
                category: "Korean",
                rating: 4.7,
                isPopular: true,
            },
            {
                restaurantId: restaurants[8]._id,
                name: "Korean Fried Chicken",
                image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500",
                description: "Double-fried crispy chicken with sweet and spicy glaze.",
                price: 650,
                category: "Chicken",
                rating: 4.9,
                isPopular: true,
            },
            {
                restaurantId: restaurants[8]._id,
                name: "Kimchi Jjigae",
                image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=500",
                description: "Hearty kimchi stew with tofu and pork, served with rice.",
                price: 480,
                category: "Korean",
                rating: 4.6,
                isPopular: false,
            }
        );

        await FoodModel.insertMany(foods);

        console.log("✅ Foods created:", foods.length);
        console.log("✅ Database seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
};

seedData();
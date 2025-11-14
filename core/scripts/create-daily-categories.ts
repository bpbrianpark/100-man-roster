import { prisma } from "../lib/prisma";
import {
  generateAllCategories,
  PropertyMap,
  ValueMaps,
  GeneratedCategory,
} from "./category-generator";

// TODO: map all property maps
const propertyMap: PropertyMap = {
  gender_list: "wdt:P21",
  occupation_list: "wdt:P106",
  citizenship_list: "wdt:P27",
};

// Value mappings: Maps property names to dictionaries of value labels and QIDs 
// remember to fix all of these, not all are correct
const valueMaps: ValueMaps = {
  // Singer/Politician/Actor/Scientist/Director/Writer based on Nationality
  gender_list: {
    Male: "Q6581097",
    Female: "Q6581072",
  },
  occupation_list: {
    singer: "Q177220",
    politician: "Q82955",
    actor: "Q33999",
    scientist: "Q43229",
    director: "Q571",
    writer: "Q464004",
  },
  citizenship_list: {
    Canada: "Q16",
    United_States: "Q30",
    United_Kingdom: "Q145",
    Japan: "Q11",
    Korea: "Q12",
    Australia: "Q15",
  },

  // Movie and directors
  film_instance_of_list: {
    film: "Q11424",
  },
  film_director_list: {
    joss_whedon: "Q571",
    george_lucas: "Q571",
    christopher_nolan: "Q571",
    quentin_tarantino: "Q571",
    david_lynch: "Q571",
    martin_scorsese: "Q571",
    alfred_hitchcock: "Q571",
    steven_spielberg: "Q571",
    ridley_scott: "Q571",
    robert_zemeckis: "Q571",
    james_cameron: "Q571",
  },

  // TODO:
  // Video games on consoles
  video_game_instance_of_list: {
    video_game: "Q7889",
  },
  video_game_console_list: {
    nintendo_switch: "Q254",    
    playstation_5: "Q266",
    xbox_series_x: "Q268",
    pc: "Q288",
    mobile: "Q290",
    nintendo_3ds: "Q254",
    wii_u: "Q254",
    wii: "Q254",
    game_boy: "Q254",
    game_boy_color: "Q254",
    game_boy_advance: "Q254",
    playstation_4: "Q266",
    playstation_3: "Q266",
    xbox_one: "Q268",
    xbox_360: "Q268",
    ps_vita: "Q290",
    ps_2: "Q266",
    ps_1: "Q266",
  },

  // TODO:
  song_form_of_creative_work: {
    song: "Q13442814",
  },
  genre_list: {
    rock: "Q128269",
    pop: "Q128269",
    jazz: "Q128269",
    classical: "Q128269",
    electronic: "Q128269",
    country: "Q128269",
    hip_hop: "Q128269",
  },

  // TODO: NBA PLAYERS 

  // TODO: NFL PLAYERS
  
  // TODO: NHL PLAYERS

  // TODO: SOCCER PLAYERS

  instance_of_list: {
    human: "Q5",
    film: "Q11424",
    television_series: "Q5398426",
    book: "Q571",
    song: "Q13442814",
    album: "Q13442814",
    artist: "Q13442814",
    video_game: "Q117038109",
    video_game_series: "Q117038109",
  },

};

/**
 * Combinations: Arrays of property names to combine into categories
 *
 * Each array defines a combination of properties that will be used to generate categories.
 * All possible combinations of values from these properties will be created.
 *
 * Example: ["gender_list", "occupation_list", "citizenship_list"]
 * will create categories like "Male Singers from Canada", "Female Singers from Canada", etc.
 */
const combinations: string[][] = [
  ["gender_list", "occupation_list", "citizenship_list"],
];

async function createCategories() {
  console.log("Starting category generation...");

  try {
    const generatedCategories = generateAllCategories(
      propertyMap,
      valueMaps,
      combinations
    );

    console.log(`Generated ${generatedCategories.length} categories`);

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const category of generatedCategories) {
      try {
        const result = await prisma.category.upsert({
          where: { slug: category.slug },
          update: {
            name: category.name,
            sparql: category.sparql,
            updateSparql: category.updateSparql,
            isDaily: true,
            hasBeenSelected: false,
          },
          create: {
            slug: category.slug,
            name: category.name,
            sparql: category.sparql,
            updateSparql: category.updateSparql,
            isDaily: true,
            hasBeenSelected: false,
            difficulties: {
              create: [
                { level: 1, limit: 10 },
                { level: 2, limit: 50 },
                { level: 3, limit: 100 },
              ],
            },
          },
        });

        if (result) {
          const existingDifficulties = await prisma.difficulty.findMany({
            where: { categoryId: result.id },
          });

          if (existingDifficulties.length === 0) {
            created++;
          } else {
            updated++;
          }
        }
      } catch (error) {
        console.error(`Error creating category ${category.slug}:`, error);
        errors++;
      }
    }

    console.log("\nCategory creation summary:");
    console.log(`  Created: ${created}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Errors: ${errors}`);
    console.log(`  Total: ${generatedCategories.length}`);
  } catch (error) {
    console.error("Error generating categories:", error);
    throw error;
  }
}

async function main() {
  try {
    await createCategories();
    console.log("\nAll categories processed successfully.");
  } catch (error) {
    console.error("Fatal error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log("Script completed.");
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("Script failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

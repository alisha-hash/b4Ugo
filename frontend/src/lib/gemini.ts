// TODO: wire up the real Gemini client once generateOutfit stops mocking.
// import { GoogleGenerativeAI } from '@google/generative-ai';
// const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
// const genAI = new GoogleGenerativeAI(apiKey);

export interface OutfitRecommendation {
  vibe: string;
  imageUrl: string;
  top: { name: string; description: string };
  bottom: { name: string; description: string };
  footwear: { name: string; description: string };
  accessories: { name: string; description: string }[];
  colorPalette: string[];
}

export async function generateOutfit(occasion: string, gender: string, style: string, budget: string, uploadedItem?: string | null): Promise<OutfitRecommendation> {
  // We use a fake delay to simulate AI thinking time (2.5 seconds)
  await new Promise(resolve => setTimeout(resolve, 2500));

  console.log(`Mocking Stylist for: ${occasion}, ${gender}, ${style}, ${budget}. Uploaded Item: ${uploadedItem ? 'Yes' : 'No'}`);

  // Determine vibes and colors based on selections
  let vibe = "A sleek, modern outfit that balances comfort with an undeniable presence.";
  let colors = ["#1A1A1A", "#E8712A", "#F5F5F5"]; // Default dark/orange/white

  let imageUrl = '/images/outfits/casual.png'; // Default

  if (style.toLowerCase().includes('traditional') || occasion.toLowerCase().includes('owambe') || occasion.toLowerCase().includes('wedding')) {
    vibe = "A stunning, culturally rich ensemble designed to turn heads and celebrate heritage.";
    colors = ["#800020", "#FFD700", "#123524"]; // Burgundy, Gold, Deep Green
    imageUrl = gender.toLowerCase().includes('female') ? '/images/outfits/trad_female.png' : '/images/outfits/trad_male.png';
  } else if (style.toLowerCase().includes('luxury') || budget.toLowerCase().includes('high')) {
    vibe = "An opulent, impeccably tailored look featuring premium fabrics and exquisite detailing.";
    colors = ["#000000", "#D4AF37", "#FFFFFF"]; // Black, Gold, White
    imageUrl = gender.toLowerCase().includes('male') ? '/images/outfits/corp.png' : '/images/outfits/trad_female.png';
  } else if (style.toLowerCase().includes('casual') || style.toLowerCase().includes('minimal')) {
    vibe = "An effortlessly cool, understated fit that speaks volumes through clean lines.";
    colors = ["#EAEAEA", "#5C5C5C", "#A3B18A"]; // Neutrals, Sage
    imageUrl = '/images/outfits/casual.png';
  } else if (style.toLowerCase().includes('corporate') || occasion.toLowerCase().includes('office')) {
    vibe = "A razor-sharp, professional silhouette that commands respect while staying stylish.";
    colors = ["#1C2833", "#F2F3F4", "#7B241C"]; // Navy, Off-white, Brick Red
    imageUrl = '/images/outfits/corp.png';
  }

  if (uploadedItem) {
    vibe = `Expertly curated around your uploaded piece. ${vibe}`;
  }

  // Generate dynamic items based on gender and style
  let top = { name: "Tailored Oxford Shirt", description: "Crisp white cotton with a modern, slim fit." };
  let bottom = { name: "Tapered Chinos", description: "Lightweight fabric in a versatile neutral shade." };
  
  if (gender.toLowerCase().includes('female')) {
    if (style.toLowerCase().includes('traditional')) {
      top = { name: "Embroidered Ankara Peplum Top", description: "Vibrant geometric patterns with intricate gold thread embroidery." };
      bottom = { name: "Matching Ankara Maxi Skirt", description: "Flowy, floor-length skirt with a dramatic slit." };
    } else if (style.toLowerCase().includes('luxury')) {
      top = { name: "Silk Draped Blouse", description: "Luminous silk charmeuse with an asymmetrical neckline." };
      bottom = { name: "High-Waisted Wide Leg Trousers", description: "Fluid crepe fabric that elongates the silhouette." };
    } else {
      top = { name: "Ribbed Knit Bodysuit", description: "Form-fitting, breathable fabric with a square neckline." };
      bottom = { name: "Pleated Midi Skirt", description: "Soft, flowing fabric in a complementary solid color." };
    }
  } else {
    // Male or default
    if (style.toLowerCase().includes('traditional')) {
      top = { name: "Hand-Woven Aso-Oke Agbada", description: "A majestic, three-piece traditional robe with heavy embroidery." };
      bottom = { name: "Matching Sokoto (Trousers)", description: "Tapered traditional trousers in a rich, solid color." };
    } else if (style.toLowerCase().includes('corporate')) {
      top = { name: "Bespoke Two-Piece Suit Jacket", description: "Super 120s wool in a subtle herringbone weave." };
      bottom = { name: "Flat-Front Suit Trousers", description: "Perfectly tailored to break just above the shoe." };
    }
  }

  // If user uploaded an item, assume the top is their item for the sake of the demo.
  if (uploadedItem) {
    top = { name: "Your Uploaded Piece", description: "The foundation of this look. We built the rest of the outfit specifically to complement this item." };
  }

  return {
    vibe,
    imageUrl,
    top,
    bottom,
    footwear: { 
      name: style.toLowerCase().includes('traditional') ? "Handcrafted Leather Mules" : "Designer Chelsea Boots", 
      description: "Premium leather finishing with a sleek, modern profile." 
    },
    accessories: [
      { name: "Statement Timepiece", description: "Minimalist face with a brushed metal band." },
      { name: style.toLowerCase().includes('traditional') ? "Coral Beads" : "Signature Sunglasses", description: "Adds the perfect finishing touch of personality." }
    ],
    colorPalette: colors
  };
}

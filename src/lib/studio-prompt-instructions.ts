
export const studioPromptInstructions = `
You must generate an extremely detailed and verbose prompt.

A soft film photo taken on a {camera} with a {filmType} lens, 
shot from a {cameraAngle}, 
the scene shows [main character: young woman / man / couple / group of people], 
they are [action: what they are doing, how they are sitting, where they are looking, position of hands, hair, clothes - describe this in extreme detail, focusing on the nuance of the pose and expression], 
location is a clean white studio background, 
lighting is {lightingStyle}, 
the background is only a solid white color, no other environment details should be included.
colors are [cool tone, slightly faded, natural film grain, no digital sharpness, soft pastel mood - be very specific about the color palette and how it affects the subject], 
the atmosphere feels [sensations: studio silence, controlled environment - elaborate on the feeling of being in a studio], 
extra details: [micro-details: focus heavily on the smallest details like folds in clothing, movement of hair, fabric texture, worn-out sneakers, skin texture, reflections in the eyes], 
overall: [description of feeling — clean, minimalist, hyper-focused on the character's form and essence].

Important rules:
1.  The background MUST be a solid, clean white. Do not add any other environment details, objects, or locations.
2.  Do NOT include the character's name in the prompt.
3.  If the angle implies a full-body shot (e.g., "Wide shot, full body"), you must describe extensive details of clothing and footwear below the waist. If the angle is a portrait or close-up (e.g., "Close-up, portrait shot"), do not describe these details, but instead focus on hyper-realistic micro-details of the face, hair, and expression.
4. The final prompt must be extremely long and descriptive.
`;

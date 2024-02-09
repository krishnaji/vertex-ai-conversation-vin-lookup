const functions = require('@google-cloud/functions-framework');
const {VertexAI} = require('@google-cloud/vertexai');

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({project: 'YOUR_PROJECT_ID', location: 'us-central1'});
const model = 'gemini-pro';

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generation_config: {
    "max_output_tokens": 2048,
    "temperature": 0.9,
    "top_p": 1
},
});

async function generateContent(data) {
  const req = {
    contents: [{role: 'user', parts: [{text: data}]}],
  };

  const result = await generativeModel.generateContent(req);
  const response = result.response;
 
  const text = response.candidates[0].content.parts[0].text;
  const newText = text.replace(/"/g, "").replace(/\n/g, "<br>");
  return newText;
};



const search = async (searchQuery) => {
  const response = await fetch(searchQuery);
  const data = await response.json();
  const results = await generateContent(
    `summarize All the details from this  :\n ${JSON.stringify(data)} \n\n Example Output:Vehicle Details:

    * Make: BMW
    * Model: X3
    * Model Year: 2023
    * Body Class: Sport Utility Vehicle (SUV)/Multi-Purpose Vehicle (MPV)
    * Engine: 2.0L 4-cylinder with 248 horsepower
    * GVWR: Class 1D: 5,001 - 6,000 lb (2,268 - 2,722 kg)
    * Manufacturer: BMW MANUFACTURER CORPORATION / BMW NORTH AMERICA
    * Plant Location: GREER, SOUTH CAROLINA, UNITED STATES (USA)
    
    Safety Features:
    
    * ABS: Standard
    * Airbags:
    * Curtain: 1st and 2nd Rows
    * Front: 1st Row (Driver and Passenger)
    * Knee: 1st Row (Driver and Passenger)
    * Side: 1st Row (Driver and Passenger)
    * Auto Reverse System: Standard
    * Blind Spot Monitor: Standard
    * Dynamic Brake Support: Standard
    * Electronic Stability Control (ESC): Standard
    * Event Data Recorder (EDR): Standard
    * Forward Collision Warning: Standard
    * Keyless Ignition: Standard
    * Lane Departure Warning: Standard
    * Lower Beam Headlamp Light Source: LED
    * Park Assist: Optional
    * Pretensioners: Yes
    * Rear Cross Traffic Alert: Standard
    * Rear Visibility System: Standard
    * Semiautomatic Headlamp Beam Switching: Standard
    * Traction Control: Standard
    
    Other Features:
    
    * Daytime Running Lights: Standard
    * Entertainment System: Unknown
    * Seats: Unknown
    * Trim: xDrive30i
    * Windows: Unknown`
  );
  return results;
};
 
functions.http('vinDecoder', (req, res) => {
if (req.body.sessionInfo && req.body.sessionInfo.parameters) {
  const params = req.body.sessionInfo.parameters;
  const vin = params.vin;
  const searchQuery = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`;
  console.log(searchQuery);

  search(searchQuery).then((results) => {
  let  status = {
      "success": true
    }
  const response = {
    fulfillmentResponse: {
    messages: [
        {
            text: {
                text: [
                  JSON.stringify(results) // this is the message for the agent to return
                ],
            },
        },
    ],
    },
    sessionInfo: {
        parameters: status , // these are the parameters that will be set and returned to the agent
    },
};
    res.send(response);
  });
}

});
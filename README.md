# PhilaWatch - Together for a Safer Philadelphia
PhilaWatch pulls data from the past year of crime across Philly and shows a heatmap to warn users of the potential trends in an area. Users can search an area within the Philadelphia Area on the map and the app will assess the risks and provide data on recent crimes.  The app uses generative AI to creating a summarizing "danger score" for an area you're planning on travelling to at a certain time, making sure you're always prepared without having to scroll through the map. Furthermore, users can add their own alerts of signs of crime such as vandalism or broken lights for real-time updates and police monitoring, using a quick photo that is automatically analyzed and sent to warn others about. 

## Technology & Stack 
The frontend of our app is built on **React Native**, with the **Google Maps API** used for heatmap features. 

Our backend is hosted on **Flask** APIs that store data in local files, using **Pandas** for efficient data manipulation, pre-trained **Roboflow** models for crime suspect detection, and **Cerebras** for LLM functionality.

## What we learned
This was our first time using an LLM (Cerebras too, at that) with CSV data, so we learned the nuances of whether or not to embed the data and how to sift through for the best results while also assuring speed. We also learned about the Google Maps API, and how it compares to other mapviews on the web like Cesium or Mapbox. 

## What's next for PhilaWatch
While looking for crime data to use, we found data more pertinent towards giving danger scores for times and places, which could be helpful in making people aware of areas on the go. We also want to look into using larger models for object detection, since our proof-of-concept using a set number of crime indicators showed the promise of using pretrained models. Beyond implementation, we want to get PhilaWatch in the hands of the people and police of Philly, turning it into a tool people can use quickly and continuously and have an observable effect on Philly's crime scene

# PhilaWatch - Together for a Safer Philadelphia
PhilaWatch pulls data from the past year of crime across Philly and shows a heatmap to warn users of the potential trends in an area. Users can search an area within the Philadelphia Area on the map and the app will assess the risks and provide data on recent crimes.  The app uses generative AI to creating a summarizing "danger score" for an area you're planning on travelling to at a certain time, making sure you're always prepared without having to scroll through the map. Furthermore, users can add their own alerts of signs of crime such as vandalism or broken lights for real-time updates and police monitoring, using a quick photo that is automatically analyzed and sent to warn others about. 

## Technology & Stack 
The frontend of our app is built on **React Native**, with the **Google Maps API** used for heatmap features. 

Our backend is hosted on **Flask** APIs that store data in local files, using **Pandas** for efficient data manipulation, pre-trained **Roboflow** models for crime suspect detection, and **Cerebras** for LLM functionality.

## Welcome to Philawatch!
Inspiration
Before we came to Philly, most of our friends in the area told us about how difficult the city could be to walk in - and our first night confirmed that. We saw that there could be more done to prevent people from falling into bad situations, while lightening the atmosphere around crime amongst residents.

We also noticed a lack of projects within social sustainability over the years, and we would love to bring this topic to light at PennApps. After all, "social" is one of the three main pillars of sustainability.

What it does
PhilaWatch pulls data from crime incidents in the past year across Philly and shows a heatmap to warn users of potential trends in a certain area. Users can search for an area on the map and the app will assess the risks and provide data on recent crimes. In addition, the app uses generative AI to creating a summarizing "danger score" (from 1 to 5) for an area you're planning on travelling to at a certain time, making sure you're always prepared without having to scroll through the map. Furthermore, users can add their own alerts of signs of crime such as vandalism or broken lights for real-time updates and police monitoring, using a quick photo that is automatically analyzed and sent to warn others about.

To encourage people to contribute to the database of signs of crime, the app gamifies the process - people get points for their contributions for keeping the city safe, and are motivated to keep doing so in a public leaderboard. Users get custom profile icons and badges for achieving new spots on the leaderboard, increasing the feeling of being a "protector of the city".

How we built it
The frontend of our app is built on React Native, with the Google Maps API used for heatmap features.

Our backend is hosted on Flask APIs that store data in local files, using pandas for efficient data manipulation, pre-trained Roboflow models for crime suspect detection, and Cerebras for LLM functionality.

Challenges we ran into
Implementation-wise, we struggled with integrating each component of our app with each other. We structured our app at the beginning where most functions required the basic CRUD apps to be completed, however we tried filling in the gaps of our APIs with assumptions about someone else's, which made merging a mess at the end.

Design-wise, we struggled with achieving the goal of having a lighter atmosphere amongst crime to push more people to contribute to the app, whilst keeping a serious attitude about the implications of being a witness to crime. We had to be careful with our layout, color scheme, and messaging in order to achieve the right balance of messaging.

Accomplishments that we're proud of
We're proud of the scale we were able to bring into this app. Though it came with having a few optimizations, we were able to engineer it to use >100K recent crime entries as basis for heatmaps and prompting with ease, and were left with room to use more data or independently make our danger score model stronger. We're also proud of the feel of the user experience, since the speed at which you could report crime risks or assess risk of an area made it all the more convenient to use.

What we learned
This was our first time using an LLM (Cerebras too, at that) with CSV data, so we learned the nuances of whether or not to embed the data and how to sift through for the best results while also assuring speed. We also learned about the Google Maps API, and how it compares to other mapviews on the web like Cesium or Mapbox.

What's next for PhilaWatch
While looking for crime data to use, we found data more pertinent towards giving danger scores for times and places, which could be helpful in making people aware of areas on the go. We also want to look into using larger models for object detection, since our proof-of-concept using a set number of crime indicators showed the promise of using pretrained models. Beyond implementation, we want to get PhilaWatch in the hands of the people and police of Philly, turning it into a tool people can use quickly and continuously and have an observable effect on Philly's crime scene

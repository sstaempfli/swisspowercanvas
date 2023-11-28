# Project Title

[[_TOC_]]

## Team Members
1. Shana Staempfli
2. Liv Weiss
3. Aurel Sostizzo
4. Noah Fecker

## Project Description 
Our project aims to create an interactive visualization of power plants in Switzerland using TypeScript and D3.js. 
The visualization will provide insights into the amount of power produced in different cantons and municipalities. 
Users will have the option to filter the data based on energy sources such as solar, bio, or nuclear energy. 
Additionally, users can choose to display the information either per municipality or per canton.


### Project goals
1. Develop an interactive and visually appealing map of the distribution of power plants across cantons and municipalities.
2. Enable users to explore aggregated power production data based on cantons or municipalities, without displaying individual power plants.
3. Implement filtering options for the different energy sources. 



### Data Sources
Add here all used datasources and their origin.

https://opendata.swiss/de/dataset/elektrizitatsproduktionsanlagen

### Tasks
Define all the tasks you want your app to solve.

The user should be able to see how much energy is produced in a specific canton or municipality.
The user should be able to see how the energy is produced.
The user should be able to see in which canton or municipality a certain energy source is used most often.


## Requirements
Write here all intructions to build the environment and run your code.\
**NOTE:** If we cannot run your code following these requirements we will not be able to evaluate it.

## How to Run
Write here **DETAILED** intructions on how to run your code.\
**NOTE:** If we cannot run your code following these instructions we will not be able to evaluate it.

As an example here are the instructions to run the Dummy Project:
To run the Dummy project you have to:
- clone the repository;
- open a terminal instance and using the command ```cd``` move to the folder where the project has been downloaded;
- then run:


### Local Development

Only change files inside the `src` directory.

**Client side**

All client side files are located in the `src/client` directory.

**Server side**

All server side files are located in the `src/server` directory.

### Local Testing

**run container for local testing**

```bash
docker build -t my-webapp .

docker run -it --rm -p 5173:5173 my-webapp
```
Open a browser and connect to http://localhost:5173

**run bash in interactive container**
```bash
docker build -t my-webapp src/.

docker run -it --rm -p 5173:5173 my-webapp bash
```


## Milestones
Document here the major milestones of your code and future planned steps.\
- [ ] Display a map of Switzerland showcasing the data on the amount of power produced in each canton.
  - [ ] Implement the display of the Swiss map on the frontend.
  - [ ] Create the backend to calculate the values of produced energy for each canton.
  - [ ] Establish a connection between the frontend and backend.
  - [ ] Present the data nicely in the map

- [ ] Milestone 2
  - [ ] Sub-task: ...
  - [ ] Sub-task: ...

Create a list subtask.\
Open an issue for each subtask. Once you create a subtask, link the corresponding issue.\
Create a merge request (with corresponding branch) from each issue.\
Finally accept the merge request once issue is resolved. Once you complete a task, link the corresponding merge commit.\
Take a look at [Issues and Branches](https://www.youtube.com/watch?v=DSuSBuVYpys) for more details. 

This will help you have a clearer overview of what you are currently doing, track your progress and organise your work among yourselves. Moreover it gives us more insights on your progress.  

## Weekly Summary 
Write here a short summary with weekly progress, including challanges and open questions.\
We will use this to understand what your struggles and where did the weekly effort go to.

## Versioning
Create stable versions of your code each week by using gitlab tags.\
Take a look at [Gitlab Tags](https://docs.gitlab.com/ee/topics/git/tags.html) for more details. 

Then list here the weekly tags. \
We will evaluate your code every week, based on the corresponding version.

Tags:
- Milestone 1: ...
- Milestone 2: ...
- Milestone 3: ...
- ...




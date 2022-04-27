1. 用SSH 进入EC2 instance
2. Start docker service:
sudo service docker start
sudo usermod -a -G docker ec2-user

3. 进入route file
cd AWS-main/server/routes/

4. open and edit surveyRoutes.js and save changes:
sudo vim surveyRoutes.js

5. run the whole program
cd ~/AWS-main/
docker-compose build (need some time to build)
docker-compose up (wait until no new messages pop up)

6. open the EC2 endpoint and 3000 port to see the result

7. stop the docker-compose:
control + C





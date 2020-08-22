from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from django.template import Context, loader
from django.shortcuts import render
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
                                                                                                           
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.select import Select 

import json
import os

def index(request):
    return render(request, 'index.html')

def getDepartments(request):
    files = os.listdir('./web/course_json_files/.')
    data = {}
    data['departments'] = files
    return JsonResponse(data)

def getSections(request, department, course_code):
    with open('course_json_files/'+department+'/'+course_code+'.txt', encoding='utf-8') as json_file:
        data = json.load(json_file)
    return JsonResponse(data)

def getDepartmentCourses(request, department):
    with open('course_json_files/'+department+'/courses.txt', encoding='utf-8') as json_file:
        data = json.load(json_file)
    return JsonResponse(data)


def getHourFromString(hour):
    #print(hour)
    day = hour[:3]
    start_end_index = hour.find('-')
    start = hour[4:start_end_index]
    end_end_index = start_end_index+6
    end = hour[start_end_index+1:end_end_index]
    squareBracketIndex = hour.find('[')
    type = " "
    place = " "
    if (squareBracketIndex > 0):
        place = hour[end_end_index:squareBracketIndex]
        type = hour[squareBracketIndex+1:squareBracketIndex+2]
    else:
        place = hour[end_end_index:]
    list = []
    list.append(day)
    list.append(start)
    list.append(end)
    list.append(place)
    list.append(type)
    return list


def convertToJson(session_number, teacher, hours_list):
    session = {}
    session['session_number'] = session_number
    session['teacher'] = teacher
    session['hours'] = []
    for hour in hours_list:
        session['hours'].append({
            'day' : hour[0],
            'start' : hour[1],
            'end' : hour[2],
            'place' : hour[3],
            'type' : hour[4]
        })
    return session


def getHoursList(hours):
    hours_list = []
    nextLineIndex = hours.find('\n')
    while(nextLineIndex != -1):
        hour = hours[:nextLineIndex]
        hour_details = getHourFromString(hour)
        hours_list.append(hour_details)
        hours = hours[nextLineIndex+1:]
        nextLineIndex = hours.find('\n')
    hour_details = getHourFromString(hours)
    hours_list.append(hour_details)
    return hours_list

def saveJSON(department, data):
    if not os.path.exists('course_json_files/'+department):
        os.mkdir('course_json_files/'+department)
    with open('course_json_files/'+department+ '/'+ data['course_code'] +'.txt', 'w', encoding='utf-8') as outfile:
        json.dump(data, outfile, ensure_ascii=False)

def saveCoursesJSON(department, courses):
    with open('course_json_files/'+department+ '/courses.txt', 'w', encoding='utf-8') as outfile:
        json.dump(courses, outfile, ensure_ascii=False)
def getCoursesAndSaveJson(tbody, department):
    data = {}
    data['course_code'] = " "
    courses = {}
    courses['courses'] = []
    for course in tbody.find_elements_by_xpath('.//tr'):
        cols = course.find_elements_by_xpath('.//td')
        course_name = cols[0].text
        course_code = course_name[:course_name.find('-')]
        session_number = course_name[course_name.find('-')+1:]
        teacher = cols[2].text
        hours = cols[14].text
        hours_list = getHoursList(hours)

        if data['course_code'] == " ":
            data['course_name'] = course_name
            data['course_code'] = course_code
            data['session'] = []
            courses['courses'].append(course_code)
        session_data = convertToJson(session_number, teacher, hours_list)
        if course_code == data['course_code']:
            data['session'].append(session_data)
        else:
            saveJSON(department, data)
            data['course_name'] = course_name
            data['course_code'] = course_code
            data['session'] = []
            data['session'].append(session_data)
            courses['courses'].append(course_code)
    saveJSON(department, data) # last row
    saveCoursesJSON(department, courses)

def getCourses():
    chromedriver = 'C:/Users/OrduLou/Desktop/chrome_driver/chromedriver.exe'
    options = webdriver.ChromeOptions()
    options.add_argument('headless')
    options.add_argument('window-size=1200x600') # optional
    
    browser_for_departments = webdriver.Chrome(executable_path=chromedriver, chrome_options=options)
    
    browser_for_departments.get('https://stars.bilkent.edu.tr/homepage/plain_offerings')

    delay = 3 # seconds
    #browser_for_departments.save_screenshot('C:\\Users\\OrduLou\\Downloads\\headless_chrome_test.png')
    deparments = WebDriverWait(browser_for_departments, delay).until(EC.presence_of_element_located((By.XPATH, '/html/body/div[6]/div[2]/div/div/table/tbody')))
    chromedriver = 'C:\\Users\\OrduLou\\Desktop\\chrome_driver\\chromedriver.exe'
    options = webdriver.ChromeOptions()
    options.add_argument('headless')
    options.add_argument('window-size=1200x600') # optional
    
    browser = webdriver.Chrome(executable_path=chromedriver, chrome_options=options)

    for department in deparments.find_elements_by_xpath('.//tr'):
        department_name = department.get_attribute("id")
        print('NOW GETTING COURSES FOR ' + department_name)
        try:
            browser.get('https://stars.bilkent.edu.tr/homepage/plain_offerings')
            
            row = WebDriverWait(browser, delay).until(EC.presence_of_element_located((By.ID, department_name)))
            row.click()
            #browser.save_screenshot('C:\\Users\\OrduLou\\Downloads\\cs_clicked.png')
            semesters = WebDriverWait(browser, delay).until(EC.presence_of_element_located((By.ID, 'SEMESTER')))
            semesters = Select(browser.find_element_by_id('SEMESTER'))
            semesters.select_by_index(2)

            semesterForm = browser.find_element_by_id('poForm')
            semesterForm.submit()

            tbody = WebDriverWait(browser, delay).until(EC.presence_of_element_located((By.XPATH, '/html/body/div[6]/div[2]/div[2]/div/div/div[2]/table/tbody')))
            #browser.save_screenshot('C:\\Users\\OrduLou\\Downloads\\semesterChoosen.png')
            getCoursesAndSaveJson(tbody, department_name)
            
        except TimeoutException:
            print("Time Out Exception Occurred")
            
    browser.quit()
    browser_for_departments.quit()


def calculatePossiblePlans(request):
    #received_json_data=json.loads(request.body.decode('UTF-8'))
    courses = eval( request.body.decode("utf-8"))
    course_codes = []
    curr_sections = []

    for key in courses.keys():
        course_codes.append(key);
    result_list = []
    curr_section_numbers = []
    result = {};
    findPossiblePlans(courses, course_codes, curr_sections,curr_section_numbers, 0, result_list);
    result['plans'] = result_list
    
    return JsonResponse(result)

#

# [[[1,2], [3,4], [5,6], [7,8]], []]


def findPossiblePlans(courses, course_codes, curr_sections, curr_section_numbers, index, result):
    if index == len(course_codes):
        result.append(curr_section_numbers.copy());
        return;
    course_sections = courses[course_codes[index]]["sections"]
    section_number = len(course_sections)
    for i in range(0, section_number):
        section = course_sections[i]
        hours = getHours(section)
        intersects = checkIntersection(hours, curr_sections)
        if intersects == True:
            continue
        curr_sections.append(hours)
        if section_number == 1:
            session_number = int(section["session_number"])
            session_number = session_number - 1;
            curr_section_numbers.append(session_number)
        else:
            curr_section_numbers.append(i);
        findPossiblePlans(courses, course_codes, curr_sections, curr_section_numbers, index+1, result)
        curr_sections.pop(index)
        curr_section_numbers.pop(index)
        
def checkIntersection(hours, curr_sections):
    for hour_interval in hours:
        for section in curr_sections:
            for second_hour_interval in section:
                if (intersects(hour_interval, second_hour_interval)):
                    return True;
    return False;


def intersects(interval1, interval2):
    max_start = max(interval1[0], interval2[0]);
    min_end = min(interval1[1], interval2[1])
    if max_start <= min_end:
        return True;
    return False;

def getHours(section):
    hours = section["hours"]
    result_hours = []
    for hour_dict in hours:
        day = hour_dict["day"]
        start = hour_dict["start"]
        end = hour_dict["end"]
        if day == ' ' or day == '' or start == '' or start == ' ' or end == '' or end == ' ':
            continue
        start = appendDayToHour(day, start)
        end = appendDayToHour(day, end)
        hour = []
        hour.append(start)
        hour.append(end)
        result_hours.append(hour)
    return result_hours

def appendDayToHour(day, hour):
    cut_index = hour.find(':')
    hour_number = hour[:cut_index]
    minutes = hour[cut_index+1:]
    plus = 0
    if day == "Tue":
        plus = 24
    elif day == "Wed":
        plus = 48
    elif day == "Thu":
        plus = 72
    elif day == "Fri":
        plus = 96
    hour_number = plus + int(hour_number)
    minutes = int(minutes)
    result = hour_number*100 + minutes;
    return result
    

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseService from "../services/course.service";

const EnrollComponent = (props) => {
  let { currentUser, setCurrentUser } = props;
  const navigate = useNavigate();
  let [searchInput, setSearchInput] = useState("");
  let [searchResult, setSearchResult] = useState(null);

  const handleTakeToLogin = () => {
    navigate("/login");
  };

  const handleChangeInput = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearch = () => {
    CourseService.getCourseByName(searchInput)
      .then((data) => {
        console.log(data.data);
        setSearchResult(data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleEnroll = (e) => {
    CourseService.enroll(e.target.id)
      .then(() => {
        console.log(e.target);
        window.alert("課程註冊成功。重新導向到課程頁面。");
        navigate("/course");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div style={{ padding: "3rem" }}>
      {!currentUser && (
        <div>
          <p>請先登入後，再開始註冊課程。</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleTakeToLogin}
          >
            回到登入頁面
          </button>
        </div>
      )}

      {currentUser && currentUser.user.role === "instructor" && (
        <div>
          <h1>只有學生可註冊課程。</h1>
        </div>
      )}

      {currentUser && currentUser.user.role === "student" && (
        <div className="search input-group mb-3">
          <input
            onChange={handleChangeInput}
            type="text"
            className="form-control"
          />
          <button onClick={handleSearch} className="btn btn-primary">
            搜尋
          </button>
        </div>
      )}

      {currentUser && searchResult && searchResult.length !== 0 && (
        <div>
          <p>從 API 返回的數據。</p>
          {searchResult.map((course) => (
            <div key={course._id} className="card" style={{ width: "18rem" }}>
              <div className="card-body">
                <h5 className="card-title">課程名稱：{course.title}</h5>
                <p className="card-text">{course.description}</p>
                <p>價格: {course.price}</p>
                <p>目前的學生人數: {course.students.length}</p>
                <p>講師:{course.instructor.username}</p>
                <a
                  href="#"
                  onClick={handleEnroll}
                  className="card-text btn btn-primary"
                  id={course._id}
                >
                  註冊課程
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrollComponent;

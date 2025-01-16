import { useState, useEffect } from 'react';
import './style.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddEmployee() {
  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    password: "",
    salary: "",
    address: "",
    category_id: "",
    image: null,
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formKey, setFormKey] = useState(Date.now());
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get(`${apiUrl}/auth/category`)
      .then(response => {
        setCategories(response.data.categories);
      })
      .catch(err => console.log(err));
  }, []);

  const handleNavigateBack = () => {
    navigate('/dashboard/employee');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Log the categories and employee.category_id
    console.log('Categories:', categories);
    console.log('Selected Category ID:', employee.category_id);
  
    const selectedCategory = categories.find(category => category._id === employee.category_id);
    console.log('Selected Category:', selectedCategory);
  
    if (selectedCategory) {
      const formData = new FormData();
      formData.append('name', employee.name);
      formData.append('email', employee.email.toLowerCase());
      formData.append('password', employee.password);
      formData.append('address', employee.address);
      formData.append('salary', employee.salary);
      formData.append('image', employee.image);
      formData.append('category_id', employee.category_id);
      formData.append('category_name', selectedCategory.name);
  
      axios.post('http://localhost:3003/auth/add_employee', formData)
        .then(result => {
          console.log(result.data);
          if (result.data.success) {
            setSuccessMessage(result.data.message);
            setError("");
            setEmployee({
              name: "",
              email: "",
              password: "",
              salary: "",
              address: "",
              category_id: "",
              image: null,
            });
            setFormKey(Date.now());
          } else {
            setError(result.data.message);
            setSuccessMessage("");
          }
        })
        .catch(err => {
          console.log(err);
          setError("An error occurred while adding the Employee.");
          setSuccessMessage("");
        });
    } else {
      setError("Please select a valid category.");
    }
  };
  
  

  return (
    <div className='d-flex justify-content-center align-items-center mt-3 loginPage'>
      <div className="p-1 rounded loginForm">
        <div className="" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px' }}>
          <div className="mb-3">
            <button onClick={handleNavigateBack} className=" btn btn-link back-button ">&#8592; Back to Dashboard</button>
          </div>
          <div className="d-flex justify-content-between">
            <h2>Add Employee</h2>
          </div>
          <div className="form-container">
            <form key={formKey} className="row g-1" onSubmit={handleSubmit}>
              <div className="col-12">
                <label htmlFor="inputName" className="form-label">
                  <span className='bold-form-label'>Name:</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="inputName"
                  placeholder="Enter Name"
                  value={employee.name}
                  onChange={(e) => setEmployee({ ...employee, name: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label htmlFor="inputEmail4" className="form-label">
                  <span className='bold-form-label'>Email:</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="inputEmail4"
                  placeholder="Enter Email"
                  autoComplete="off"
                  value={employee.email}
                  onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label htmlFor="inputPassword4" className="form-label">
                  <span className='bold-form-label'>Password:</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="inputPassword4"
                  placeholder="Enter Password"
                  value={employee.password}
                  onChange={(e) => setEmployee({ ...employee, password: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label htmlFor="inputSalary" className="form-label">
                  <span className='bold-form-label'>Salary:</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="inputSalary"
                  placeholder="Enter Salary"
                  value={employee.salary}
                  onChange={(e) => setEmployee({ ...employee, salary: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label htmlFor="inputAddress" className="form-label">
                  <span className='bold-form-label'>Address:</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="inputAddress"
                  placeholder="H.No. 24,Street"
                  value={employee.address}
                  onChange={(e) => setEmployee({ ...employee, address: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label htmlFor="category" className="form-label">
                  <span className='bold-form-label'>Category:</span>
                </label>
                <select
  name="category"
  id="category"
  className="form-select"
  value={employee.category_id}  // Ensure this is using the ObjectID (_id)
  onChange={(e) => {
    const selectedCategoryId = e.target.value;
    console.log('Category selected:', selectedCategoryId); // Log the selected category ID
    setEmployee({ ...employee, category_id: selectedCategoryId });
  }}
>
  <option value="">Select Category</option>
  {categories.map((category) => (
    <option key={category._id} value={category._id}> {/* Use category._id for value */}
      {category.name}
    </option>
  ))}
</select>

              </div>
              <div className="col-12 mb-3">
                <label className="form-label" htmlFor="inputGroupFile01">
                  <span className='bold-form-label'>Select Image:</span>
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="inputGroupFile01"
                  name="image"
                  onChange={(e) => setEmployee({ ...employee, image: e.target.files[0] })}
                />
              </div>
              <div className="col-12">
                <button type="submit" className="w-100 button-74">Add Employee</button>
              </div>
              {error && <div className="text-danger mt-3">{error}</div>}
              {successMessage && <div className="text-success mt-3">{successMessage}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddEmployee;

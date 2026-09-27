import { AIProvider } from './provider'
import { AIAnalysisResult } from '../types'

export const MOCK_DATABASE: Record<string, AIAnalysisResult> = {
  'bánh xe': {
    id: 'mock_wheel',
    objectName: 'Bánh xe',
    category: 'Cơ học',
    confidence: 0.94,
    summary: 'Bánh xe là vật thể hình tròn quay quanh một trục cố định, giảm ma sát tối đa khi chuyển động.',
    scientificTopics: ['Chuyển động quay', 'Bán kính & Chu vi', 'Ma sát lăn', 'Mô-men lực'],
    lesson: {
      howItWorks: 'Bánh xe biến ma sát trượt lớn thành ma sát lăn nhỏ hơn rất nhiều. Tâm bánh xe giữ vị trí cố định so với mặt đất trong khi vành bánh lăn liên tục.',
      whyItWorks: 'Vì có dạng hình tròn chuẩn, khoảng cách từ tâm đến mọi điểm trên vành luôn bằng bán kính r. Điều này giúp xe di chuyển êm ái mà không bị nhấp nhô.',
      whereItAppears: 'Bánh xe xuất hiện ở xe đạp, ô tô, quạt gió, đồng hồ cơ, bánh răng máy móc và băng tải công nghiệp.',
      interestingFact: 'Bánh xe gỗ xuất hiện khoảng 3500 TCN ở Lưỡng Hà, nhưng ban đầu được dùng để làm bàn xoay gốm chứ không phải để vận chuyển!',
      mathBehind: 'Chu vi C = 2πr. Quãng đường s = C × n (n là số vòng quay).',
      physicsBehind: 'Lực ma sát lăn nhỏ hơn ma sát trượt hàng chục lần. Mô-men quán tính I = k·m·r² quyết định năng lượng để làm quay bánh xe.',
      levelExplanations: {
        basic: 'Bánh xe tròn giúp xe di chuyển êm ái. Khoảng cách từ tâm đến vành bánh ở mọi điểm đều bằng nhau.',
        intermediate: 'Chuyển động của bánh xe là kết hợp giữa chuyển động tịnh tiến của tâm và chuyển động quay tròn xung quanh tâm với chu vi C = 2πr.',
        advanced: 'Mô-men lực τ = I·α quyết định gia tốc góc. Lực ma sát nghỉ tại điểm tiếp xúc với mặt đất tạo ra lực đẩy tịnh tiến cho xe.'
      }
    },
    calculator: {
      type: 'wheel',
      title: 'Tính Chu vi & Quãng đường Bánh xe',
      description: 'Thay đổi bán kính r và số vòng quay để xem quãng đường xe di chuyển.',
      inputs: [
        { id: 'radius', label: 'Bán kính r', unit: 'cm', defaultValue: 30, min: 10, max: 80 },
        { id: 'rotations', label: 'Số vòng quay', unit: 'vòng', defaultValue: 10, min: 1, max: 100 }
      ]
    },
    experiment: {
      title: 'Thử nghiệm Bán kính Bánh xe',
      description: 'Điều chỉnh bán kính và số vòng quay để xem đồ thị quãng đường biến đổi ra sao.',
      variables: [
        { name: 'radius', label: 'Bán kính (cm)', min: 10, max: 100, default: 30, unit: 'cm' },
        { name: 'rotations', label: 'Số vòng quay', min: 1, max: 50, default: 10, unit: 'vòng' }
      ],
      formulaExplanation: 'Bán kính ↑  →  Chu vi C ↑  →  Quãng đường mỗi vòng ↑'
    },
    quizzes: [
      {
        id: 'q_wheel_1',
        question: 'Nếu bán kính bánh xe tăng gấp đôi, chu vi sẽ thay đổi thế nào?',
        options: ['Không đổi', 'Tăng gấp đôi', 'Tăng gấp ba', 'Giảm một nửa'],
        correctAnswer: 1,
        explanation: 'Chu vi C = 2πr. Vì C tỉ lệ thuận bậc nhất với bán kính r, khi r tăng gấp đôi thì chu vi C cũng tăng gấp đôi.'
      },
      {
        id: 'q_wheel_2',
        question: 'Vì sao bánh xe lại làm giảm lực cản khi đẩy một vật nặng?',
        options: ['Vì bánh xe làm giảm khối lượng vật', 'Vì ma sát lăn nhỏ hơn nhiều so với ma sát trượt', 'Vì bánh xe tạo thêm động năng', 'Vì mặt đường tự phẳng ra'],
        correctAnswer: 1,
        explanation: 'Ma sát lăn phát sinh khi vật tròn lăn trên bề mặt nhỏ hơn rất nhiều so với ma sát trượt khi kéo lê vật đó.'
      }
    ],
    suggestedNextTopic: 'Ma sát & Mô-men quán tính'
  },
  'bóng đèn': {
    id: 'mock_lightbulb',
    objectName: 'Bóng đèn',
    category: 'Điện học',
    confidence: 0.96,
    summary: 'Bóng đèn phát sáng bằng cách biến đổi điện năng thành quang năng (và nhiệt năng).',
    scientificTopics: ['Điện năng', 'Hiệu điện thế', 'Quang năng', 'Phát xạ nhiệt'],
    lesson: {
      howItWorks: 'Dòng điện chạy qua dây tóc (hoặc chip LED) làm phát ra các hạt photon ánh sáng.',
      whyItWorks: 'Với đèn LED, các electron chuyển qua lớp bán dẫn p-n giải phóng năng lượng dưới dạng ánh sáng mà ít tỏa nhiệt hơn đèn dây tóc.',
      whereItAppears: 'Đèn chiếu sáng gia đình, đèn đường, màn hình điện thoại, TV, đèn pin và đèn pha xe.',
      interestingFact: 'Đèn LED tiết kiệm đến 80-90% năng lượng so với đèn dây tóc truyền thống nhờ không tốn năng lượng tỏa nhiệt!',
      mathBehind: 'Công suất P = U × I. Điện năng E = P × t.',
      physicsBehind: 'Định luật Joule-Lenz tỏa nhiệt Q = I²Rt. Hiệu suất phát sáng = (Quang năng / Tổng điện năng) × 100%.',
      levelExplanations: {
        basic: 'Bóng đèn chuyển điện năng thành ánh sáng giúp chúng ta nhìn thấy trong đêm.',
        intermediate: 'Công suất P (Watt) quyết định độ sáng và lượng điện tiêu thụ trong thời gian t (giờ). E = P × t.',
        advanced: 'Vùng cấm năng lượng E_g trong chất bán dẫn LED quyết định bước sóng và màu sắc của ánh sáng phát ra (λ = hc / E_g).'
      }
    },
    calculator: {
      type: 'lightbulb',
      title: 'Tính Tiêu thụ Điện năng Đèn',
      description: 'Nhập công suất bóng đèn và thời gian thắp sáng để tính số điện (kWh) và tiền điện.',
      inputs: [
        { id: 'power', label: 'Công suất', unit: 'Watt', defaultValue: 15, min: 3, max: 200 },
        { id: 'hours', label: 'Thời gian dùng / ngày', unit: 'Giờ', defaultValue: 8, min: 1, max: 24 }
      ]
    },
    experiment: {
      title: 'Thử nghiệm Tiết kiệm Điện',
      description: 'So sánh mức tiêu thụ điện giữa Đèn LED (15W) và Đèn dây tóc (75W).',
      variables: [
        { name: 'power', label: 'Công suất (W)', min: 5, max: 100, default: 15, unit: 'W' },
        { name: 'hours', label: 'Số giờ thắp sáng', min: 1, max: 24, default: 8, unit: 'giờ' }
      ],
      formulaExplanation: 'Điện năng E (kWh) = (P × t) / 1000'
    },
    quizzes: [
      {
        id: 'q_light_1',
        question: 'Đơn vị đo công suất của bóng đèn là gì?',
        options: ['Volt (V)', 'Ampere (A)', 'Watt (W)', 'Joule (J)'],
        correctAnswer: 2,
        explanation: 'Watt (W) là đơn vị đo công suất điện, thể hiện mức độ tiêu thụ điện năng trên một đơn vị thời gian.'
      }
    ]
  },
  'cây xanh': {
    id: 'mock_plant',
    objectName: 'Cây xanh',
    category: 'Sinh học',
    confidence: 0.92,
    summary: 'Cây xanh sử dụng ánh sáng mặt trời để tổng hợp chất dinh dưỡng thông qua quá trình quang hợp.',
    scientificTopics: ['Quang hợp', 'Diệp lục', 'Khí Oxy & CO2', 'Sự thoát hơi nước'],
    lesson: {
      howItWorks: 'Lá cây chứa diệp lục (chlorophyll) hấp thụ ánh sáng mặt trời, biến CO2 và nước thành Đường (Glucose) và giải phóng Oxy.',
      whyItWorks: 'Phản ứng quang hợp: 6CO2 + 6H2O + Ánh sáng → C6H12O6 + 6O2.',
      whereItAppears: 'Rừng nhiệt đới, công viên, cây cảnh trong nhà, tảo biển và thảm thực vật trái đất.',
      interestingFact: 'Cây xanh và tảo đại dương cung cấp hơn 70% lượng khí Oxy mà con người và sinh vật hít thở mỗi ngày!',
      mathBehind: 'Mối tương quan giữa diện tích lá (LAI) và lượng ánh sáng hấp thụ E_a = E_0 × (1 - e^(-k·LAI)).',
      physicsBehind: 'Chất diệp lục hấp thụ mạnh ánh sáng bước sóng xanh dương (430nm) và đỏ (660nm), phản xạ ánh sáng xanh lá nên cây có màu xanh.',
      levelExplanations: {
        basic: 'Cây xanh hấp thụ ánh sáng mặt trời và khí CO2 để tạo ra khí Oxy cho chúng ta thở.',
        intermediate: 'Quang hợp diễn ra tại lục lạp nhờ diệp lục. Cây biến năng lượng ánh sáng thành năng lượng hóa học tích trữ trong đường.',
        advanced: 'Quá trình quang hợp gồm 2 pha: Pha sáng (chuỗi truyền electron tạo ATP & NADPH) và Pha tối (chu trình Calvin cố định CO2).'
      }
    },
    calculator: {
      type: 'plant',
      title: 'Tính Chỉ số Quang hợp',
      description: 'Thay đổi cường độ ánh sáng và thời gian chiếu sáng để xem mức độ quang hợp.',
      inputs: [
        { id: 'light', label: 'Cường độ ánh sáng', unit: 'Lux', defaultValue: 15000, min: 1000, max: 40000 },
        { id: 'hours', label: 'Thời gian chiếu sáng', unit: 'Giờ', defaultValue: 8, min: 1, max: 16 }
      ]
    },
    experiment: {
      title: 'Thử nghiệm Cường độ Ánh sáng với Cây',
      description: 'Kéo slider ánh sáng để theo dõi chỉ số năng lượng tạo ra.',
      variables: [
        { name: 'light', label: 'Cường độ Lux', min: 2000, max: 35000, default: 15000, unit: 'lux' },
        { name: 'hours', label: 'Số giờ sáng', min: 2, max: 14, default: 8, unit: 'giờ' }
      ],
      formulaExplanation: 'Cường độ ánh sáng ↑  →  Tốc độ quang hợp ↑ (cho đến ngưỡng bão hòa)'
    },
    quizzes: [
      {
        id: 'q_plant_1',
        question: 'Khí nào được giải phóng ra môi trường trong quá trình quang hợp?',
        options: ['Cacbonic (CO2)', 'Oxy (O2)', 'Nito (N2)', 'Metan (CH4)'],
        correctAnswer: 1,
        explanation: 'Trong pha sáng quang hợp, nước bị phân ly (quang phân ly nước) giải phóng khí Oxy (O2) ra khí quyển.'
      }
    ]
  },
  'gương': {
    id: 'mock_mirror',
    objectName: 'Gương',
    category: 'Quang học',
    confidence: 0.95,
    summary: 'Gương là bề mặt nhẵn phẳng có khả năng phản xạ hầu như toàn bộ ánh sáng chiếu vào.',
    scientificTopics: ['Phản xạ ánh sáng', 'Góc tới & Góc phản xạ', 'Ảnh ảo', 'Gương phẳng'],
    lesson: {
      howItWorks: 'Lớp tráng bạc/nhôm sau mặt kính phản xạ các tia sáng tuân theo Định luật Phản xạ Ánh sáng.',
      whyItWorks: 'Bề mặt gương cực kỳ nhẵn bóng (độ nhấp nhô nhỏ hơn bước sóng ánh sáng) nên xảy ra phản xạ gương thay vì phản xạ tán xạ.',
      whereItAppears: 'Gương soi, kính chiếu hậu xe máy/ô tô, kính thiên văn phản xạ, ống nhòm.',
      interestingFact: 'Gương phẳng tạo ra ảnh ảo có kích thước bằng hệt vật thật, nhưng bị đối xứng trái-phải!',
      mathBehind: 'Góc phản xạ i’ = Góc tới i.',
      physicsBehind: 'Định luật phản xạ: Tia phản xạ nằm trong mặt phẳng tới. Góc phản xạ bằng góc tới (θ_r = θ_i).',
      levelExplanations: {
        basic: 'Gương dội lại ánh sáng giúp bạn nhìn thấy hình ảnh phản chiếu của chính mình.',
        intermediate: 'Góc tới i bằng góc phản xạ i’. Ảnh trong gương phẳng là ảnh ảo, đối xứng qua mặt gương.',
        advanced: 'Bản chất của phản xạ gương là sự tương tác dao động điện từ của sóng ánh sáng với electron tự do trong lớp kim loại tráng gương.'
      }
    },
    calculator: {
      type: 'mirror',
      title: 'Tính Góc Phản xạ Gương',
      description: 'Điều chỉnh góc tới để xem góc phản xạ và góc lệch đường đi của tia sáng.',
      inputs: [
        { id: 'angle', label: 'Góc tới (θ_i)', unit: 'Độ (°)', defaultValue: 30, min: 0, max: 85 }
      ]
    },
    experiment: {
      title: 'Thử nghiệm Định luật Phản xạ',
      description: 'Xoay góc chiếu tia sáng tới mặt gương để kiểm tra góc phản xạ tương ứng.',
      variables: [
        { name: 'angle', label: 'Góc tới (°)', min: 0, max: 85, default: 45, unit: '°' }
      ],
      formulaExplanation: 'Góc tới θ_i luôn bằng Góc phản xạ θ_r'
    },
    quizzes: [
      {
        id: 'q_mirror_1',
        question: 'Nếu góc tới giữa tia sáng và pháp tuyến gương là 40°, góc phản xạ sẽ bằng bao nhiêu?',
        options: ['20°', '40°', '50°', '80°'],
        correctAnswer: 1,
        explanation: 'Theo Định luật Phản xạ Ánh sáng, góc phản xạ luôn luôn bằng góc tới, do đó góc phản xạ cũng bằng 40°.'
      }
    ]
  },
  'cầu thang': {
    id: 'mock_stair',
    objectName: 'Cầu thang',
    category: 'Cơ học',
    confidence: 0.91,
    summary: 'Cầu thang là một loại mặt phẳng nghiêng phân bậc giúp con người di chuyển lên cao dễ dàng.',
    scientificTopics: ['Mặt phẳng nghiêng', 'Công cơ học', 'Độ dốc & Độ nghiêng', 'Thế năng trọng trường'],
    lesson: {
      howItWorks: 'Cầu thang kéo dài quãng đường di chuyển nghiêng để giảm bớt lực nâng thẳng đứng cần thiết.',
      whyItWorks: 'Công cơ học A = F × s. Khi tăng quãng đường s (bằng cách đi theo chiều dài dốc/bậc), lực F nâng cơ thể giảm xuống.',
      whereItAppears: 'Nhà cao tầng, lối đi dành cho xe lăn, đường đèo dốc hình xoắn ốc.',
      interestingFact: 'Cầu thang tay vịn chuẩn kiến trúc có chiều cao bậc 15-18cm để lực cơ đùi của con người làm việc ở hiệu suất sinh học tối ưu nhất!',
      mathBehind: 'Độ dốc % = (Chiều cao / Chiều dài) × 100%. Góc nghiêng θ = arctan(H / L).',
      physicsBehind: 'Lực đẩy song song mặt phẳng nghiêng F = m·g·sin(θ). Độ dốc càng nhỏ (θ nhỏ) thì lực F càng nhẹ.',
      levelExplanations: {
        basic: 'Cầu thang giúp bạn đi lên cao nhẹ nhàng hơn thay vì phải leo thẳng đứng.',
        intermediate: 'Cầu thang hoạt động như mặt phẳng nghiêng: đổi quãng đường dài hơn lấy lực bước đi nhẹ hơn.',
        advanced: 'Thế năng trọng trường ΔW_p = m·g·h không đổi dù đi thẳng hay đi thang, nhưng công suất sinh học P = A / t giảm đi đáng kể.'
      }
    },
    calculator: {
      type: 'stair',
      title: 'Tính Độ dốc & Góc nghiêng Cầu thang',
      description: 'Nhập chiều cao tầng và chiều dài chân thang để tính độ dốc %. ',
      inputs: [
        { id: 'height', label: 'Chiều cao (Rise)', unit: 'cm', defaultValue: 180, min: 50, max: 400 },
        { id: 'length', label: 'Chiều dài (Run)', unit: 'cm', defaultValue: 300, min: 100, max: 600 }
      ]
    },
    experiment: {
      title: 'Thử nghiệm Độ dốc & Lực leo thang',
      description: 'Điều chỉnh chiều dài cầu thang để xem độ dốc và góc nghiêng biến đổi.',
      variables: [
        { name: 'height', label: 'Chiều cao (cm)', min: 100, max: 300, default: 180, unit: 'cm' },
        { name: 'length', label: 'Chiều dài (cm)', min: 150, max: 500, default: 300, unit: 'cm' }
      ],
      formulaExplanation: 'Chiều dài thang ↑  →  Độ dốc ↓  →  Lực bước đi nhẹ hơn'
    },
    quizzes: [
      {
        id: 'q_stair_1',
        question: 'Cầu thang áp dụng nguyên lý của máy cơ đơn giản nào?',
        options: ['Đòn đòn', 'Ròng rọc', 'Mặt phẳng nghiêng', 'Bánh xe & Trục'],
        correctAnswer: 2,
        explanation: 'Cầu thang là hình thức chia nhỏ của mặt phẳng nghiêng, giúp biến chuyển động đi lên thành chuyển động nghiêng có lực yêu cầu nhỏ hơn.'
      }
    ]
  },
  'cầu vồng': {
    id: 'mock_rainbow',
    objectName: 'Cầu vồng',
    category: 'Quang học',
    confidence: 0.98,
    summary: 'Cầu vồng là hiện tượng quang học tự nhiên do ánh sáng mặt trời bị tán sắc và phản xạ trong các giọt nước mưa.',
    scientificTopics: ['Tán sắc ánh sáng', 'Khúc xạ ánh sáng', 'Phản xạ toàn phần', 'Quang phổ liên tục'],
    lesson: {
      howItWorks: 'Mỗi giọt nước mưa đóng vai trò như một lăng kính nhỏ: Khúc xạ ánh sáng trắng -> Phản xạ mặt sau giọt nước -> Khúc xạ ra ngoài thành 7 màu.',
      whyItWorks: 'Chiết suất của nước thay đổi theo bước sóng ánh sáng (chiết suất màu đỏ nhỏ hơn màu tím), khiến góc lệch khúc xạ của các màu khác nhau.',
      whereItAppears: 'Bầu trời sau cơn mưa, đài phun nước, thác nước, sương mù buổi sáng.',
      interestingFact: 'Cầu vồng thực chất là một hình tròn hoàn chỉnh! Từ mặt đất chúng ta chỉ nhìn thấy một nửa hình vòm do bị đường chân trời che khuất.',
      mathBehind: 'Góc lệch của tia đỏ là 42° và tia tím là 40° so với hướng chùm ánh sáng tới.',
      physicsBehind: 'Định luật Snell khúc xạ n1·sin(i) = n2·sin(r). Ánh sáng trắng phân phân tách thành chuỗi bước sóng từ 380nm (Tím) đến 750nm (Đỏ).',
      levelExplanations: {
        basic: 'Giọt nước mưa chia ánh sáng mặt trời thành 7 sắc màu rực rỡ.',
        intermediate: 'Ánh sáng trắng bị khúc xạ và tán sắc khi chui qua giọt nước mưa thành các màu: Đỏ, Cam, Vàng, Lục, Lam, Chàm, Tím.',
        advanced: 'Góc quan sát góc vòm cầu vồng chính (Primary Rainbow) luôn cố định ở 42° do điều kiện cực đại của góc lệch d(θ)/di = 0.'
      }
    },
    calculator: {
      type: 'generic',
      title: 'Quang phổ Cầu vồng',
      description: 'Khám phá bước sóng và góc lệch của các dải màu cầu vồng.',
      inputs: [
        { id: 'wavelength', label: 'Bước sóng ánh sáng', unit: 'nm', defaultValue: 650, min: 380, max: 750 }
      ]
    },
    experiment: {
      title: 'Thử nghiệm Tán sắc Ánh sáng',
      description: 'Điều chỉnh bước sóng ánh sáng để xem màu tương ứng trong dải quang phổ.',
      variables: [
        { name: 'wavelength', label: 'Bước sóng (nm)', min: 380, max: 750, default: 550, unit: 'nm' }
      ],
      formulaExplanation: 'Bước sóng ngắn (Tím 400nm) bị bẻ cong nhiều hơn Bước sóng dài (Đỏ 700nm)'
    },
    quizzes: [
      {
        id: 'q_rainbow_1',
        question: 'Thứ tự các màu sắc của cầu vồng tính từ vòng ngoài cùng vào trong là gì?',
        options: ['Tím -> Đỏ', 'Đỏ -> Tím', 'Lục -> Vàng', 'Lam -> Đỏ'],
        correctAnswer: 1,
        explanation: 'Cầu vồng chính có dải màu ngoài cùng là màu Đỏ (góc lệch 42°) và trong cùng là màu Tím (góc lệch 40°).'
      }
    ]
  }
}

// Add generic fallbacks for ly nước, bóng, xe đạp
MOCK_DATABASE['ly nước'] = {
  ...MOCK_DATABASE['gương'],
  id: 'mock_water_glass',
  objectName: 'Ly nước',
  category: 'Quang học',
  confidence: 0.93,
  summary: 'Ly nước vừa có tính chất khúc xạ ánh sáng vừa hoạt động như một thấu kính hội tụ.',
  scientificTopics: ['Khúc xạ ánh sáng', 'Thấu kính hội tụ', 'Khối lượng riêng', 'Áp suất chất lỏng']
}

MOCK_DATABASE['bóng'] = {
  ...MOCK_DATABASE['bánh xe'],
  id: 'mock_ball',
  objectName: 'Quả bóng',
  category: 'Cơ học',
  confidence: 0.95,
  summary: 'Quả bóng đàn hồi tốt nhờ áp suất không khí bên trong và lực nảy khi va chạm.',
  scientificTopics: ['Đàn hồi', 'Áp suất khí', 'Động năng & Thế năng', 'Chuyển động parabol']
}

MOCK_DATABASE['xe đạp'] = {
  ...MOCK_DATABASE['bánh xe'],
  id: 'mock_bicycle',
  objectName: 'Xe đạp',
  category: 'Cơ học',
  confidence: 0.97,
  summary: 'Xe đạp kết hợp nhiều máy cơ đơn giản: Bánh xe, Xích đĩa truyền động, Đòn đòn tay thắng.',
  scientificTopics: ['Tỷ số truyền bánh răng', 'Cân bằng động', 'Chuyển động quay', 'Ma sát']
}

export class MockProvider implements AIProvider {
  async analyzeImage(imageUri: string, options?: { prompt?: string }): Promise<AIAnalysisResult> {
    // Artificial slight delay to simulate AI thinking visually
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Check if prompt or image name hints at a specific item
    const lower = (options?.prompt || '').toLowerCase()
    
    for (const key of Object.keys(MOCK_DATABASE)) {
      if (lower.includes(key)) {
        return MOCK_DATABASE[key]
      }
    }
    
    // Default mock object: Bánh xe
    return MOCK_DATABASE['bánh xe']
  }
}
